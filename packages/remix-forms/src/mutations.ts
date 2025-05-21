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

/**
 * Build a nested error object from a list of {@link InputError|InputErrors}.
 *
 * @param errors - Errors returned by the mutation
 * @param schema - Schema describing the expected values
 * @returns Nested map of error messages keyed by path
 *
 * @example
 * ```ts
 * const errors = [new InputError('Required', ['name'])]
 * errorMessagesForSchema(errors, schema)
 * ```
 */
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

/**
 * Result of a mutation executed by {@link performMutation} or
 * {@link formAction}.
 *
 * The object indicates whether the mutation succeeded and either contains the
 * returned data or a map of validation errors keyed by field name. This type is
 * useful for typing loader and action responses.
 *
 * @example
 * ```ts
 * if (result.success) console.log(result.data)
 * ```
 *
 * @example
 * ```ts
 * if (!result.success) console.log(result.errors)
 * ```
 */
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

/**
 * Options for {@link formAction}.
 *
 * @property request - The HTTP request containing form data
 * @property schema - Zod schema used to validate the values
 * @property mutation - Function executed with the parsed values
 * @property [context] - Extra context passed to the mutation
 * @property [transformValues] - Modify values before calling the mutation
 * @property [transformResult] - Modify the result before returning
 * @property [successPath] - Path or function resolving the redirect location on success
 *
 * @example
 * ```ts
 * // inside a route action
 * export const action = async ({ request }) =>
 *   formAction({ request, schema, mutation, successPath: '/done' })
 * ```
 *
 * @example
 * ```ts
 * formAction({ request, schema, mutation })
 * ```
 */
type FormActionProps<Schema extends FormSchema, D> = {
  successPath?: ((data: D) => string | Promise<string>) | string
} & PerformMutationProps<Schema, D>

/**
 * Read form data from a request and coerce values according to the schema.
 *
 * @param request - HTTP request containing form data
 * @param schema - Zod schema describing the form fields
 * @returns Parsed and coerced form values
 *
 * @example
 * ```ts
 * const values = await getFormValues(request, schema)
 * ```
 */
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

/**
 * Execute a mutation with values from a form request.
 *
 * @param options.request - The incoming request with form data
 * @param options.schema - Schema describing the form structure
 * @param options.mutation - Function executed with the parsed values
 * @param options.context - Context object forwarded to the mutation
 * @param options.transformValues - Modify values before calling the mutation
 * @param options.transformResult - Modify the result before returning
 * @returns The mutation result with success flag and data or errors
 *
 * @example
 * ```ts
 * const result = await performMutation({ request, schema, mutation })
 * ```
 *
 * @example
 * ```ts
 * performMutation({ request, schema, mutation, context: { user } })
 * ```
 *
 * This helper is usually used from {@link formAction} but can also be called
 * directly when you need custom handling of the mutation result.
 */
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

/**
 * React Router v7 action helper that runs a mutation and handles redirects.
 *
 * @param options.request - The request to read form data from
 * @param options.schema - Schema describing the expected form fields
 * @param options.mutation - Function that performs the actual mutation
 * @param options.context - Context object forwarded to the mutation
 * @param options.transformValues - Map the form values before running the mutation
 * @param options.transformResult - Map the mutation result before returning
 * @param options.successPath - Path or function resolving the redirect location on success
 * @returns A response created with `data()` containing the mutation result
 *
 * @example
 * ```ts
 * export const action = () => formAction({ request, schema, mutation })
 * ```
 *
 * @example
 * ```ts
 * formAction({ request, schema, mutation, successPath: '/thanks' })
 * ```
 *
 * Use this function as your route's action to parse the form values, execute
 * the mutation and respond with either a redirect or an object containing the
 * errors and submitted values.
 */
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

export { performMutation, formAction, errorMessagesForSchema, getFormValues }
