import type { z } from 'zod'

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

// biome-ignore lint/suspicious/noExplicitAny: Generic constraint requires any for Zod type flexibility
type FormSchema = z.ZodPipe<any> | z.ZodTransform<any> | z.ZodObject<any>

// biome-ignore lint/suspicious/noExplicitAny: Generic constraint requires any for Zod type flexibility
type ObjectFromSchema<T> = T extends z.ZodObject<any>
  ? T
  : // biome-ignore lint/suspicious/noExplicitAny: Generic constraint requires any for Zod type flexibility
    T extends z.ZodPipe<infer A, any>
    ? ObjectFromSchema<A>
    : T extends z.ZodTransform<infer A>
      ? ObjectFromSchema<A>
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

  // Zod 4: Access via _zod.def instead of _def
  // biome-ignore lint/suspicious/noExplicitAny: Zod internal structure is not typed
  const def = (schema as any)._zod?.def
  if (!def) {
    throw new Error('Invalid schema: missing _zod.def')
  }

  // Handle pipes (extract input schema) and transforms
  if (def.type === 'pipe') {
    // For z.preprocess(fn, schema), the target object is in def.out
    // For schema.transform(fn), the source object is in def.in
    // Check if def.out is an object first (preprocess case)
    if ('shape' in def.out) {
      return def.out as ObjectFromSchema<Schema>
    }
    // Otherwise recurse into def.in (transform case)
    return objectFromSchema(def.in)
  }

  if (def.type === 'transform') {
    // Transforms don't have an inner schema in Zod 4, this shouldn't happen
    throw new Error('Cannot extract object schema from standalone transform')
  }

  // For other wrapper types, recurse
  if (def.innerType) {
    return objectFromSchema(def.innerType)
  }

  throw new Error(`Cannot extract object schema from type: ${def.type}`)
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
