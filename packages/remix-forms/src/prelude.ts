import type { z } from 'zod'

type FormSchema<T extends z.ZodTypeAny = z.SomeZodObject | z.ZodEffects<any>> =
  | z.ZodEffects<T>
  | z.SomeZodObject

type ObjectFromSchema<T> = T extends z.SomeZodObject
  ? T
  : T extends z.ZodEffects<infer R>
  ? ObjectFromSchema<R>
  : never

type ComponentOrTagName<ElementType extends keyof JSX.IntrinsicElements> =
  | React.ComponentType<JSX.IntrinsicElements[ElementType]>
  | string

type KeysOfStrings<T extends object> = {
  [K in keyof T]: T[K] extends string ? K : never
}[keyof T]

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

function browser(): boolean {
  return typeof document === 'object'
}

export { objectFromSchema, mapObject, parseDate, browser }
export type { FormSchema, ObjectFromSchema, ComponentOrTagName, KeysOfStrings }
