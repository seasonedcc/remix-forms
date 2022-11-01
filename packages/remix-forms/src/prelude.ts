import { z } from 'zod'

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
  return 'shape' in schema ? schema : objectFromSchema(schema._def.schema)
}

function mapObject<T extends Record<string, V>, V, NewValue>(
  obj: T,
  mapFunction: (key: string, value: V) => [string, NewValue],
) {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => mapFunction(key, value)),
  )
}

export { objectFromSchema, mapObject }
export type { FormSchema, ObjectFromSchema }
