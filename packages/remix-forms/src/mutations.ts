import type { DomainFunction, SchemaError } from 'domain-functions'
import { inputFromForm } from 'domain-functions'
import type { z } from 'zod'
import { coerceValue } from './coercions'
import type { FormSchema } from './prelude'
import { objectFromSchema } from './prelude'

type NestedErrors<SchemaType> = {
  [Property in keyof SchemaType]: string[] | NestedErrors<SchemaType[Property]>
}

function errorMessagesForSchema<T extends z.ZodTypeAny>(
  errors: SchemaError[],
  _schema: T,
): NestedErrors<z.infer<T>> {
  type SchemaType = z.infer<T>
  type ErrorObject = { path: string[]; messages: string[] }

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

  const toErrorObject = (errors: SchemaError[]): ErrorObject[] =>
    errors.map(({ path, message }) => ({
      path,
      messages: [message],
    }))

  const unifyPaths = (errors: SchemaError[]) =>
    toErrorObject(errors).reduce((memo, error) => {
      const comparePath = compareStringArrays(error.path)
      const mergeErrorMessages = ({ path, messages }: ErrorObject) =>
        comparePath(path)
          ? { path, messages: [...messages, ...error.messages] }
          : { path, messages }
      const existingPath = memo.find(({ path }) => comparePath(path))

      return existingPath ? memo.map(mergeErrorMessages) : [...memo, error]
    }, [] as ErrorObject[])

  const errorTree = unifyPaths(errors).reduce((memo, schemaError) => {
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

type PerformMutation<SchemaType, D extends unknown> =
  | ({ success: false } & FormActionFailure<SchemaType>)
  | { success: true; data: D }

type Callback = (request: Request) => Promise<Redirect | void>

type PerformMutationProps<Schema extends FormSchema, D extends unknown> = {
  request: Request
  schema: Schema
  mutation: DomainFunction<D>
  environment?: unknown
  transformValues?: (
    values: FormValues<z.infer<Schema>>,
  ) => Record<string, unknown>
}

type FormActionProps<Schema extends FormSchema, D extends unknown> = {
  beforeAction?: Callback
  beforeSuccess?: Callback
  successPath?: string | ((data: D) => string)
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
  environment,
  transformValues = (values) => values,
}: PerformMutationProps<Schema, D>): Promise<
  PerformMutation<z.infer<Schema>, D>
> {
  const values = await getFormValues(request, schema)
  const result = await mutation(transformValues(values), environment)

  if (result.success) {
    return { success: true, data: result.data }
  } else {
    return {
      success: false,
      errors: {
        ...errorMessagesForSchema(result.inputErrors, schema),
        _global:
          result.errors.length || result.environmentErrors.length
            ? [...result.errors, ...result.environmentErrors].map(
                (error) => error.message,
              )
            : undefined,
      } as FormErrors<Schema>,
      values,
    }
  }
}

type RedirectFunction = (url: string, init?: number | ResponseInit) => Redirect
type Redirect = Response & { [redirectSymbol]: never }
declare const redirectSymbol: unique symbol

function createFormAction({ redirect }: { redirect: RedirectFunction }) {
  async function formAction<Schema extends FormSchema, D extends unknown>({
    request,
    schema,
    mutation,
    environment,
    transformValues,
    beforeAction,
    beforeSuccess,
    successPath,
  }: FormActionProps<Schema, D>): Promise<Redirect | D> {
    if (beforeAction) {
      const beforeActionRedirect = await beforeAction(request)
      if (beforeActionRedirect) return beforeActionRedirect
    }

    const result = await performMutation({
      request,
      schema,
      mutation,
      environment,
      transformValues,
    })

    if (result.success) {
      if (beforeSuccess) {
        const beforeSuccessRedirect = await beforeSuccess(request)
        if (beforeSuccessRedirect) return beforeSuccessRedirect
      }

      const path =
        typeof successPath === 'function'
          ? successPath(result.data)
          : successPath

      return path ? redirect(path) : result.data
    } else {
      return { errors: result.errors, values: result.values } as D
    }
  }

  return formAction
}

export type {
  FormValues,
  FormErrors,
  PerformMutation,
  Callback,
  PerformMutationProps,
  FormActionProps,
}

export { performMutation, createFormAction }
