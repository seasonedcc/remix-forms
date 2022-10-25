import type { z } from 'zod'

//@ts-ignore
type FormSchema = z.SomeZodObject | z.ZodEffects<FormSchema>
type ObjectFromSchema<T> = T extends z.SomeZodObject
  ? T
  : T extends z.ZodEffects<infer R>
  ? ObjectFromSchema<R>
  : never

function objectFromSchema<Schema extends FormSchema>(
  schema: Schema,
): ObjectFromSchema<Schema> {
  return 'shape' in schema
    ? (schema as ObjectFromSchema<Schema>)
    : objectFromSchema(schema._def.schema)
}

export { objectFromSchema }
export type { FormSchema, ObjectFromSchema }
