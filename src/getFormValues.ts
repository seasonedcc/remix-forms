import { SomeZodObject, z, ZodBoolean, ZodNumber, ZodTypeAny } from 'zod'
import { FormValues } from './formAction.server'

export default async function getFormValues<Schema extends SomeZodObject>(
  request: Request,
  schema: Schema,
): Promise<FormValues<z.infer<Schema>>> {
  const formData = await request.clone().formData()

  let values: FormValues<z.infer<Schema>> = {}
  for (const key in schema.shape) {
    const value = formData.get(key)
    const shape = schema.shape[key]
    values[key as keyof z.infer<Schema>] = coerceValue(value, shape)
  }

  return values
}

function coerceValue(
  value: FormDataEntryValue | null,
  shape: ZodTypeAny,
): string | boolean | number | bigint | null {
  if (shape instanceof ZodBoolean) return Boolean(value)
  if (shape instanceof ZodNumber) return Number(value)

  return String(value)
}
