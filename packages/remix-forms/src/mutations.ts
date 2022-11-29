import type { DomainFunction } from 'domain-functions'
import { inputFromForm, errorMessagesForSchema } from 'domain-functions'
import type { z } from 'zod'
import { coerceValue } from './coercions'
import type { FormSchema } from './prelude'
import { objectFromSchema } from './prelude'

type RedirectFunction = (url: string, init?: number | ResponseInit) => Response
type JsonFunction = <Data>(data: Data, init?: number | ResponseInit) => Response

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

type Callback = (request: Request) => Promise<Response | void>

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

function createFormAction({
  redirect,
  json,
}: {
  redirect: RedirectFunction
  json: JsonFunction
}) {
  async function formAction<Schema extends FormSchema, D extends unknown>({
    request,
    schema,
    mutation,
    environment,
    transformValues,
    beforeAction,
    beforeSuccess,
    successPath,
  }: FormActionProps<Schema, D>): Promise<Response> {
    if (beforeAction) {
      const beforeActionResponse = await beforeAction(request)
      if (beforeActionResponse) return beforeActionResponse
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
        const beforeSuccessResponse = await beforeSuccess(request)
        if (beforeSuccessResponse) return beforeSuccessResponse
      }

      const path =
        typeof successPath === 'function'
          ? successPath(result.data)
          : successPath

      return path ? redirect(path) : json(result.data)
    } else {
      return json({ errors: result.errors, values: result.values })
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
