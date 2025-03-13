import type { ComposableWithSchema } from 'composable-functions'
import {
  type InputError,
  inputFromForm,
  isInputError,
} from 'composable-functions'
import { data, redirect } from 'react-router'
import type { z } from 'zod'
import { coerceValue } from './coercions'
import type { FormSchema } from './prelude'
import { objectFromSchema } from './prelude'

type DataWithResponseInit<T> = ReturnType<typeof data<T>>

type NestedErrors<SchemaType> = {
  [Property in keyof SchemaType]: string[] | NestedErrors<SchemaType[Property]>
}

function errorMessagesForSchema<T extends z.ZodTypeAny>(
  errors: Error[],
  _schema: T
): NestedErrors<z.infer<T>> {
  type SchemaType = z.infer<T>
  type ErrorObject = { path: string[]; messages: string[] }

  const inputErrors = errors.filter(isInputError) as InputError[]

  const nest = (
    { path, messages }: ErrorObject,
    root: Record<string, unknown>
  ) => {
    const [head, ...tail] = path
    root[head] =
      tail.length === 0
        ? messages
        : nest(
            { path: tail, messages },
            (root[head] as Record<string, unknown>) ?? {}
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

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
type FormValues<SchemaType> = Partial<Record<keyof SchemaType, any>>

type FormErrors<SchemaType> = Partial<
  Record<keyof SchemaType | '_global', string[]>
>

type MutationResult<SchemaType, D> =
  | ({ success: false } & FormActionFailure<SchemaType>)
  | { success: true; data: D }

type PerformMutationProps<Schema extends FormSchema, D> = {
  request: Request
  schema: Schema
  mutation: ComposableWithSchema<D>
  context?: unknown
  transformValues?: (
    values: FormValues<z.infer<Schema>>
  ) => Record<string, unknown>
  transformResult?: (
    result: MutationResult<Schema, D>
  ) => MutationResult<Schema, D> | Promise<MutationResult<Schema, D>>
}

type FormActionProps<Schema extends FormSchema, D> = {
  successPath?: ((data: D) => string | Promise<string>) | string
} & PerformMutationProps<Schema, D>

async function getFormValues<Schema extends FormSchema>(
  request: Request,
  schema: Schema
): Promise<FormValues<z.infer<Schema>>> {
  const shape = objectFromSchema(schema).shape

  const input = await inputFromForm(request)

  const values: FormValues<z.infer<Schema>> = {}
  for (const key in shape) {
    const value = input[key]
    values[key as keyof z.infer<Schema>] = coerceValue(value, shape[key])
  }

  return values
}

async function performMutation<Schema extends FormSchema, D>({
  request,
  schema,
  mutation,
  context,
  transformResult = (result) => result,
  transformValues = (values) => values,
}: PerformMutationProps<Schema, D>): Promise<
  MutationResult<z.infer<Schema>, D>
> {
  const values = await getFormValues(request, schema)
  const result = await mutation(transformValues(values), context)

  if (result.success) {
    return transformResult({ success: true, data: result.data })
  }
  const global = result.errors.filter((e) => !isInputError(e))

  return transformResult({
    success: false,
    errors:
      global.length > 0
        ? ({
            ...errorMessagesForSchema(result.errors, schema),
            _global: global.map((error) => error.message),
          } as FormErrors<Schema>)
        : (errorMessagesForSchema(result.errors, schema) as FormErrors<Schema>),
    values,
  })
}

async function formAction<Schema extends FormSchema, D>({
  successPath,
  ...performMutationOptions
}: FormActionProps<Schema, D>): Promise<
  DataWithResponseInit<MutationResult<z.infer<Schema>, D>>
> {
  const result = await performMutation(performMutationOptions)

  if (result.success) {
    const path =
      typeof successPath === 'function'
        ? await successPath(result.data)
        : successPath

    if (path) {
      throw redirect(path)
    }

    return data(result)
  }
  return data(result, { status: 422 })
}

export type {
  FormValues,
  FormErrors,
  MutationResult,
  PerformMutationProps,
  FormActionProps,
}

export { performMutation, formAction }
