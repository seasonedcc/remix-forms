import type { z } from 'zod/v4'

/**
 * Zod schema accepted by remix-forms components and utilities.
 *
 * This type covers plain objects as well as Zod effects so you can pass
 * schemas created with refinements or preprocessors.
 * It is mainly used as a generic constraint for {@link SchemaForm} and the
 * mutation helpers.
 *
 * @example
 * ```ts
 * const schema = z.object({ name: z.string() })
 * type MySchema = FormSchema<typeof schema>
 * ```
 *
 * @example
 * ```ts
 * const schema = z.object({ age: z.number() }).transform((d) => ({ ...d, ok: true }))
 * type MySchema = FormSchema<typeof schema>
 * ```
 */
type FormSchema<
  T extends z.ZodTypeAny =
    | z.SomeZodObject
    | z.ZodEffects<z.ZodTypeAny>
    | z.ZodPipeline<z.ZodTypeAny, z.ZodTypeAny>,
> =
  | z.ZodEffects<T>
  | z.ZodPipeline<z.ZodTypeAny, z.ZodTypeAny>
  | z.SomeZodObject

type Prev = [never, 0, 1, 2, 3, 4]
type ObjectFromSchema<T, D extends number = 4> = D extends 0
  ? never
  : T extends z.SomeZodObject
    ? T
    : T extends z.ZodEffects<infer R>
      ? ObjectFromSchema<R, Prev[D]>
      : T extends z.ZodPipeline<infer _, infer R>
        ? ObjectFromSchema<R, Prev[D]>
        : never

type ComponentOrTagName<ElementType extends keyof JSX.IntrinsicElements> =
  | React.ComponentType<JSX.IntrinsicElements[ElementType]>
  | string

type KeysOfStrings<T extends object> = {
  [K in keyof T]: T[K] extends string ? K : never
}[keyof T]

function objectFromSchema<Schema extends FormSchema>(
  schema: Schema
): ObjectFromSchema<Schema> {
  return 'shape' in schema
    ? (schema as ObjectFromSchema<Schema>)
    : objectFromSchema(
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        (schema as any)._def.out ?? (schema as any)._def.schema
      )
}

function mapObject<T extends Record<string, V>, V, NewValue>(
  obj: T,
  mapFunction: (key: string, value: V) => [string, NewValue]
) {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => mapFunction(key, value))
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
