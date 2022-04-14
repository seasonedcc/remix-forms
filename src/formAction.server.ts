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

export type FormAction<SchemaType> = FormActionFailure<SchemaType> | Response

export type Callback = (request: Request) => Promise<Response | void>

export type FormActionProps<Schema extends SomeZodObject> = {
  request: Request
  schema: Schema
  mutation: DomainFunction
  beforeAction?: Callback
  beforeSuccess?: Callback
  successPath?: string
}

export async function formAction<Schema extends SomeZodObject>({
  request,
  schema,
  mutation,
  beforeAction,
  beforeSuccess,
  successPath,
}: FormActionProps<Schema>): Promise<FormAction<z.infer<Schema>>> {
  if (beforeAction) {
    const beforeActionResponse = await beforeAction(request)
    if (beforeActionResponse) return beforeActionResponse
  }

  const values = await getFormValues(request, schema)
  const result = await mutation(values)

  if (result.success) {
    if (beforeSuccess) {
      const beforeSuccessResponse = await beforeSuccess(request)
      if (beforeSuccessResponse) return beforeSuccessResponse
    }

    return successPath ? redirect(successPath) : json(result.data)
  } else {
    return {
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
