import type { ComposableWithSchema } from 'composable-functions'
import { inputFromForm, InputError, isInputError } from 'composable-functions'
import type { z } from 'zod'
import { coerceValue } from './coercions'
import type { FormSchema } from './prelude'
import { objectFromSchema } from './prelude'
import { redirect } from 'react-router'

type NestedErrors<SchemaType> = {
  [Property in keyof SchemaType]: string[] | NestedErrors<SchemaType[Property]>
}

function errorMessagesForSchema<T extends z.ZodTypeAny>(
  errors: Error[],
  _schema: T,
): NestedErrors<z.infer<T>> {
  type SchemaType = z.infer<T>
  type ErrorObject = { path: string[]; messages: string[] }

  const inputErrors = errors.filter(isInputError) as InputError[]

  const nest = (
    { path, messages }: ErrorObject,
    root: Record<string, unknown>,
  ) => {
    const [head, ...tail] = path
    root[head] =
      tail.length === 0
        ? messages
        : nest(
            { path: tail, messages },
            (root[head] as Record<string, unknown>) ?? {},
          )
    return root
  }

  const compareStringArrays = (a: string[]) => (b: string[]) =>
    JSON.stringify(a) === JSON.stringify(b)

  const toErrorObject = (errors: InputError[]): ErrorObject[] =>
    errors.map(({ path, message }) => ({
      path,
      messages: [message],
    }))

  const unifyPaths = (errors: InputError[]) =>
    toErrorObject(errors).reduce((memo, error) => {
      const comparePath = compareStringArrays(error.path)
      const mergeErrorMessages = ({ path, messages }: ErrorObject) =>
        comparePath(path)
          ? { path, messages: [...messages, ...error.messages] }
          : { path, messages }
      const existingPath = memo.find(({ path }) => comparePath(path))

      return existingPath ? memo.map(mergeErrorMessages) : [...memo, error]
    }, [] as ErrorObject[])

  const errorTree = unifyPaths(inputErrors).reduce((memo, schemaError) => {
    const errorBranch = nest(schemaError, memo)

    return { ...memo, ...errorBranch }
  }, {}) as NestedErrors<SchemaType>

  return errorTree
}

type FormActionFailure<SchemaType> = {
  errors: FormErrors<SchemaType>
  values: FormValues<SchemaType>
}

type FormValues<SchemaType> = Partial<Record<keyof SchemaType, any>>

type FormErrors<SchemaType> = Partial<
  Record<keyof SchemaType | '_global', string[]>
>

type MutationResult<SchemaType, D extends unknown> =
  | ({ success: false } & FormActionFailure<SchemaType>)
  | { success: true; data: D }

type PerformMutationProps<Schema extends FormSchema, D extends unknown> = {
  request: Request
  schema: Schema
  mutation: ComposableWithSchema<D>
  context?: unknown
  transformValues?: (
    values: FormValues<z.infer<Schema>>,
  ) => Record<string, unknown>
  transformResult?: (
    result: MutationResult<Schema, D>,
  ) => MutationResult<Schema, D> | Promise<MutationResult<Schema, D>>
}

type FormActionProps<Schema extends FormSchema, D extends unknown> = {
  successPath?: ((data: D) => string | Promise<string>) | string
} & PerformMutationProps<Schema, D>

async function getFormValues<Schema extends FormSchema>(
  request: Request,
  schema: Schema,
): Promise<FormValues<z.infer<Schema>>> {
  const shape = objectFromSchema(schema).shape

  const input = await inputFromForm(request)

  let values: FormValues<z.infer<Schema>> = {}
  for (const key in shape) {
    const value = input[key]
    values[key as keyof z.infer<Schema>] = coerceValue(value, shape[key])
  }

  return values
}

async function performMutation<Schema extends FormSchema, D extends unknown>({
  request,
  schema,
  mutation,
  context,
  transformValues = (values) => values,
}: PerformMutationProps<Schema, D>): Promise<
  MutationResult<z.infer<Schema>, D>
> {
  const values = await getFormValues(request, schema)
  const result = await mutation(transformValues(values), context)

  if (result.success) {
    return { success: true, data: result.data }
  } else {
    const global = result.errors.filter((e) => !isInputError(e))

    return {
      success: false,
      errors:
        global.length > 0
          ? ({
              ...errorMessagesForSchema(result.errors, schema),
              _global: global.map((error) => error.message),
            } as FormErrors<Schema>)
          : (errorMessagesForSchema(
              result.errors,
              schema,
            ) as FormErrors<Schema>),
      values,
    }
  }
}

async function formAction<Schema extends FormSchema, D extends unknown>({
  request,
  schema,
  mutation,
  context,
  successPath,
  ...performMutationOptions
}: FormActionProps<Schema, D>): Promise<D> {
  const result = await performMutation({
    request,
    schema,
    mutation,
    context,
    ...performMutationOptions,
  })

  if (result.success) {
    const path =
      typeof successPath === 'function'
        ? await successPath(result.data)
        : successPath

    if (path) {
      throw redirect(path)
    }

    return result.data
  } else {
    return { errors: result.errors, values: result.values } as D
  }
}

export type {
  FormValues,
  FormErrors,
  MutationResult,
  PerformMutationProps,
  FormActionProps,
}

export { performMutation, formAction }
