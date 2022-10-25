import { json, redirect } from '@remix-run/server-runtime'
import type { DomainFunction } from 'domain-functions'
import { errorMessagesForSchema } from 'domain-functions'
import type { SomeZodObject, z } from 'zod'
import { getFormValues } from './getFormValues'
import type { FormSchema } from './prelude'

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
}

type FormActionProps<Schema extends FormSchema, D extends unknown> = {
  beforeAction?: Callback
  beforeSuccess?: Callback
  successPath?: string | ((data: D) => string)
} & PerformMutationProps<Schema, D>

async function performMutation<Schema extends FormSchema, D extends unknown>({
  request,
  schema,
  mutation,
  environment,
}: PerformMutationProps<Schema, D>): Promise<
  PerformMutation<z.infer<Schema>, D>
> {
  const values = await getFormValues(request, schema)
  const result = await mutation(values, environment)

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

async function formAction<Schema extends FormSchema, D extends unknown>({
  request,
  schema,
  mutation,
  environment,
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
  })

  if (result.success) {
    if (beforeSuccess) {
      const beforeSuccessResponse = await beforeSuccess(request)
      if (beforeSuccessResponse) return beforeSuccessResponse
    }

    const path =
      typeof successPath === 'function' ? successPath(result.data) : successPath

    return path ? redirect(path) : json(result.data)
  } else {
    return json({ errors: result.errors, values: result.values })
  }
}

export type {
  FormValues,
  FormErrors,
  PerformMutation,
  Callback,
  PerformMutationProps,
  FormActionProps,
}
export { performMutation, formAction }
