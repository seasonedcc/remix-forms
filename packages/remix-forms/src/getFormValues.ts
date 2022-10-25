import { inputFromForm } from 'domain-functions'
import type { z } from 'zod'
import { coerceValue } from './coercions'
import type { FormValues } from './formAction.server'
import type { FormSchema } from './prelude'
import { objectFromSchema } from './prelude'

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

export { getFormValues }
