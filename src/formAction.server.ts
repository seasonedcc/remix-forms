import { json, redirect } from '@remix-run/server-runtime'
import { DomainFunction, errorMessagesForSchema } from 'remix-domains'
import { SomeZodObject, z } from 'zod'
import getFormValues from './getFormValues'

type FormActionFailure<SchemaType> = {
  errors: FormErrors<SchemaType>
  values: FormValues<SchemaType>
}

export type FormValues<SchemaType> = Partial<Record<keyof SchemaType, any>>

export type FormErrors<SchemaType> = Partial<
  Record<keyof SchemaType | '_global', string[]>
>

export type PerformMutation<SchemaType, D extends unknown> =
  | ({ success: false } & FormActionFailure<SchemaType>)
  | { success: true; data: D }

export type Callback = (request: Request) => Promise<Response | void>

export type PerformMutationProps<
  Schema extends SomeZodObject,
  D extends unknown,
> = {
  request: Request
  schema: Schema
  mutation: DomainFunction<D>
}

export type FormActionProps<Schema extends SomeZodObject, D extends unknown> = {
  beforeAction?: Callback
  beforeSuccess?: Callback
  successPath?: string
} & PerformMutationProps<Schema, D>

export async function performMutation<
  Schema extends SomeZodObject,
  D extends unknown,
>({
  request,
  schema,
  mutation,
}: PerformMutationProps<Schema, D>): Promise<
  PerformMutation<z.infer<Schema>, D>
> {
  const values = await getFormValues(request, schema)
  const result = await mutation(values)

  if (result.success) {
    return { success: true, data: result.data }
  } else {
    return {
      success: false,
      errors: {
        ...errorMessagesForSchema(result.inputErrors, schema),
        _global: result.errors.length
          ? result.errors.map((error) => error.message)
          : undefined,
      },
      values,
    }
  }
}

export async function formAction<
  Schema extends SomeZodObject,
  D extends unknown,
>({
  request,
  schema,
  mutation,
  beforeAction,
  beforeSuccess,
  successPath,
}: FormActionProps<Schema, D>): Promise<Response> {
  if (beforeAction) {
    const beforeActionResponse = await beforeAction(request)
    if (beforeActionResponse) return beforeActionResponse
  }

  const result = await performMutation({ request, schema, mutation })

  if (result.success) {
    if (beforeSuccess) {
      const beforeSuccessResponse = await beforeSuccess(request)
      if (beforeSuccessResponse) return beforeSuccessResponse
    }

    return successPath ? redirect(successPath) : json(result.data)
  } else {
    return json({ errors: result.errors, values: result.values })
  }
}
