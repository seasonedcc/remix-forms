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

function parseDate(value?: Date | string) {
  if (!value) return value

  const dateTime = typeof value === 'string' ? value : value.toISOString()
  const [date] = dateTime.split('T')
  return date
}

export { objectFromSchema, mapObject, parseDate }
export type { FormSchema, ObjectFromSchema }
