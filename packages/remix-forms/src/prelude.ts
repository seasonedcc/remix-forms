import type { z } from 'zod/v4'
import { getZodDef } from './get-zod-def'

/**
 * Zod schema accepted by remix-forms components and utilities.
 *
 * This type covers plain objects as well as Zod effects or pipelines so you can
 * pass schemas created with refinements, preprocessors or the `pipe` API.
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
type EffectsLike<T extends z.ZodTypeAny> =
  | z.ZodEffects<T>
  | z.ZodPipeline<z.ZodTypeAny, T>

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
type FormSchema<T extends z.ZodTypeAny = z.SomeZodObject | EffectsLike<any>> =
  | EffectsLike<T>
  | z.SomeZodObject

type ObjectFromSchema<T> = T extends z.SomeZodObject
  ? T
  : T extends z.ZodEffects<infer R>
    ? ObjectFromSchema<R>
    : // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      T extends z.ZodPipeline<any, infer R>
      ? ObjectFromSchema<R>
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
  if ('shape' in schema) {
    return schema as ObjectFromSchema<Schema>
  }

  const def = getZodDef(schema)

  // biome-ignore lint/suspicious/noExplicitAny: checking Zod internals
  if ('schema' in (def as any)) {
    // ZodEffects
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    return objectFromSchema((def as any).schema)
  }

  // biome-ignore lint/suspicious/noExplicitAny: checking Zod internals
  if ('out' in (def as any)) {
    // ZodPipeline
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    return objectFromSchema((def as any).out)
  }

  // biome-ignore lint/suspicious/noExplicitAny: fallback for unexpected defs
  return def as any
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
