import type { z } from 'zod'

type FormSchema<T extends z.ZodTypeAny = z.SomeZodObject | z.ZodEffects<any>> =
  | z.ZodEffects<T>
  | z.SomeZodObject

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
