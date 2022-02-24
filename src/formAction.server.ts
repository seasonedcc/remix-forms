import { redirect } from '@remix-run/server-runtime'
import { SomeZodObject, z } from 'zod'
import getFormValues from './getFormValues'
import parseSchemaErrors from './parseSchemaErrors'

type FormActionFailure<SchemaType> = {
  errors: FormErrors<SchemaType>
  values: FormValues<SchemaType>
}

export type FormValues<SchemaType> = Partial<Record<keyof SchemaType, any>>

export type FormErrors<SchemaType> = Partial<
  Record<keyof SchemaType | '_global', string[]>
>

export type FormAction<SchemaType> = FormActionFailure<SchemaType> | Response

export type Mutation<Schema extends SomeZodObject> = (
  values: z.infer<Schema>,
) => Promise<void | { errors: FormErrors<z.infer<Schema>> }>

export type Callback = (request: Request) => Promise<Response | void>

export type FormActionProps<Schema extends SomeZodObject> = {
  request: Request
  schema: Schema
  mutation: Mutation<Schema>
  beforeAction?: Callback
  beforeSuccess?: Callback
  successPath: string
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
  const result = schema.safeParse(values)

  if (result.success) {
    const mutationResult = await mutation(result.data)

    if (mutationResult?.errors) {
      return { errors: mutationResult?.errors, values }
    }

    if (beforeSuccess) {
      const beforeSuccessResponse = await beforeSuccess(request)
      if (beforeSuccessResponse) return beforeSuccessResponse
    }

    return redirect(successPath)
  } else {
    return { errors: parseSchemaErrors(result, schema), values }
  }
}
