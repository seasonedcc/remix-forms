import { SafeParseError, SomeZodObject } from 'zod'
import { FormErrors } from './formAction.server'

export default function parseSchemaErrors<SchemaType>(
  result: SafeParseError<any>,
  schema: SomeZodObject,
): FormErrors<SchemaType> {
  const rawErrors: Record<string, any> = result.error.format()
  const errors: FormErrors<SchemaType> = {}
  for (const stringKey in schema.shape) {
    const key = stringKey as keyof SchemaType
    const itemErrors = (rawErrors[stringKey]?._errors || []) as string[]

    if (itemErrors?.length) {
      errors[key] = itemErrors
    }
  }
  return errors
}
