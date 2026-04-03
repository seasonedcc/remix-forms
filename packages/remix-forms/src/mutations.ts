import type { FileUpload } from '@remix-run/form-data-parser'
import { parseFormData } from '@remix-run/form-data-parser'
import type { StandardSchemaV1 } from '@standard-schema/spec'
import type { FormValue } from 'coerce-form-data'
import { FormDataCoercionError, coerceValue } from 'coerce-form-data'
import type { ComposableWithSchema } from 'composable-functions'
import {
  type InputError,
  inputFromForm,
  inputFromFormData,
  isInputError,
} from 'composable-functions'
import { data, redirect } from 'react-router'
import { schemaFields } from 'schema-info'
import type { FormSchema, Infer } from './prelude'

type DataWithResponseInit<T> = ReturnType<typeof data<T>>

/**
 * Build a flat error map from a list of {@link InputError|InputErrors}.
 *
 * Nested paths are joined with `'.'` so the returned keys align with
 * React Hook Form's {@link https://react-hook-form.com/docs/useform/seterror | Path} notation.
 *
 * @param errors - Errors returned by the mutation
 * @param schema - Schema describing the expected values
 * @returns Flat map of dot-path keys to error message arrays
 *
 * @example
 * ```ts
 * const errors = [new InputError('Required', ['user', 'name'])]
 * errorMessagesForSchema(errors, schema)
 * // => { 'user.name': ['Required'] }
 * ```
 */
function errorMessagesForSchema<T extends StandardSchemaV1>(
  errors: Error[],
  _schema: T
): FormErrors<Infer<T>> {
  const inputErrors = errors.filter(isInputError) as InputError[]

  const result: Record<string, string[]> = {}

  for (const error of inputErrors) {
    if (error.path.length === 0) continue
    const key = error.path.join('.')
    if (result[key]) {
      result[key].push(error.message)
    } else {
      result[key] = [error.message]
    }
  }

  return result as FormErrors<Infer<T>>
}

type FormActionFailure<SchemaType> = {
  errors: FormErrors<SchemaType>
  values: FormValues<SchemaType>
}

type FormValues<SchemaType> = Partial<Record<keyof SchemaType, unknown>>

type FormErrors<SchemaType = Record<string, unknown>> = Partial<
  Record<(keyof SchemaType & string) | '_global' | (string & {}), string[]>
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

/**
 * Function that processes a file upload during form data parsing.
 *
 * Called by {@link parseFormData} for each file field in the submitted form.
 * Return a `File` to make the value available to the mutation, or
 * `undefined`/`void` to skip the upload.
 */
type UploadHandler = (
  fileUpload: FileUpload
) => Promise<File | undefined> | File | undefined

type PerformMutationProps<Schema extends FormSchema, D> = {
  request: Request
  schema: Schema
  mutation: ComposableWithSchema<D>
  context?: unknown
  uploadHandler?: UploadHandler
  transformValues?: (
    values: FormValues<Infer<Schema>>
  ) => Record<string, unknown>
  transformResult?: (
    result: MutationResult<Infer<Schema>, D>
  ) =>
    | MutationResult<Infer<Schema>, D>
    | Promise<MutationResult<Infer<Schema>, D>>
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
  schema: Schema,
  uploadHandler?: UploadHandler
): Promise<FormValues<Infer<Schema>>> {
  const fields = schemaFields(schema)
  const hasFileFields = Object.values(fields).some(
    (info) => info.type === 'file'
  )

  if (!hasFileFields) {
    const input = await inputFromForm(request)
    const values: FormValues<Infer<Schema>> = {}
    for (const key in fields) {
      const value = input[key]
      try {
        values[key as keyof Infer<Schema>] = coerceValue(
          value as FormValue,
          fields[key]
        )
      } catch (error) {
        if (error instanceof FormDataCoercionError) {
          values[key as keyof Infer<Schema>] = null
        } else {
          throw error
        }
      }
    }
    return values
  }

  const formData = uploadHandler
    ? await parseFormData(request, uploadHandler)
    : await request.formData()

  const input = inputFromFormData(formData)
  const values: FormValues<Infer<Schema>> = {}
  for (const key in fields) {
    if (fields[key].type === 'file') {
      const file = formData.get(key)
      values[key as keyof Infer<Schema>] =
        file instanceof File && file.size > 0 ? file : null
    } else {
      const value = input[key]
      try {
        values[key as keyof Infer<Schema>] = coerceValue(
          value as FormValue,
          fields[key]
        )
      } catch (error) {
        if (error instanceof FormDataCoercionError) {
          values[key as keyof Infer<Schema>] = null
        } else {
          throw error
        }
      }
    }
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
  uploadHandler,
  transformResult = (result) => result,
  transformValues = (values) => values,
}: PerformMutationProps<Schema, D>): Promise<MutationResult<Infer<Schema>, D>> {
  const values = await getFormValues(request, schema, uploadHandler)
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
          } as FormErrors<Infer<Schema>>)
        : (errorMessagesForSchema(result.errors, schema) as FormErrors<
            Infer<Schema>
          >),
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
  DataWithResponseInit<MutationResult<Infer<Schema>, D>>
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
  UploadHandler,
}

export { performMutation, formAction, errorMessagesForSchema, getFormValues }
