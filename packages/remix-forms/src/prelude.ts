import type { ZodObject, z } from 'zod'

/**
 * Type alias for ZodObject with any shape.
 * Used throughout the codebase as a generic constraint when we need to accept
 * any Zod object schema regardless of its specific shape.
 */
// biome-ignore lint/suspicious/noExplicitAny: Generic constraint requires any for Zod type flexibility
type AnyZodObject = ZodObject<any>

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
type FormSchema = z.ZodPipe<any> | z.ZodTransform<any> | AnyZodObject

type ObjectFromSchema<T> = T extends AnyZodObject
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

function mapObject<T extends Record<string, V>, V, NewValue>(
  obj: T,
  mapFunction: (key: string, value: V) => [string, NewValue]
) {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => mapFunction(key, value))
  )
}

function browser(): boolean {
  return typeof document === 'object'
}

export { mapObject, browser }

export type {
  AnyZodObject,
  FormSchema,
  ObjectFromSchema,
  ComponentOrTagName,
  KeysOfStrings,
}
