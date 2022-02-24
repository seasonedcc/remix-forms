import { SomeZodObject, z } from 'zod'
import { FormValues } from './formAction.server'

export default async function getFormValues<Schema extends SomeZodObject>(
  request: Request,
  schema: Schema,
): Promise<FormValues<z.infer<Schema>>> {
  const formData = await request.clone().formData()

  let values: FormValues<z.infer<Schema>> = {}
  for (const key in schema.shape) {
    values[key as keyof z.infer<Schema>] = formData.get(key)
  }

  return values
}
