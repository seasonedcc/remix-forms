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

/**
 * Type definition for Zod internal structure.
 * This matches Zod's internal `_zod.def` structure.
 */
type ZodInternalDef = {
  type: string
  innerType?: unknown
  in?: unknown
  out?: unknown
  defaultValue?: unknown
  values?: Iterable<unknown>
  [key: string]: unknown
}

/**
 * Safely access Zod's internal definition structure.
 * Centralizes the unsafe cast to avoid scattering `any` throughout the codebase.
 *
 * @param schema - A Zod schema or unknown value
 * @returns The internal definition object, or null if not available
 */
function getZodDef(schema: unknown): ZodInternalDef | null {
  // biome-ignore lint/suspicious/noExplicitAny: Zod internal structure is not typed
  return (schema as any)?._zod?.def ?? null
}

/**
 * Safely access Zod enum values from internal structure.
 * Centralizes the unsafe cast for enum value access.
 *
 * @param schema - A Zod schema or unknown value
 * @returns The enum values iterable, or null if not available
 */
function getZodValues(schema: unknown): Iterable<unknown> | null {
  // biome-ignore lint/suspicious/noExplicitAny: Zod internal structure is not typed
  return (schema as any)?._zod?.values ?? null
}

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

function objectFromSchema<Schema extends FormSchema>(
  schema: Schema
): ObjectFromSchema<Schema> {
  if ('shape' in schema) {
    return schema as ObjectFromSchema<Schema>
  }

  const def = getZodDef(schema)

  if (!def) {
    throw new Error(
      'Invalid schema provided to remix-forms.\n' +
        'remix-forms requires a valid Zod schema to introspect field types and generate forms.\n' +
        'The value provided does not have the internal Zod structure (_zod.def).\n' +
        'Make sure you are passing a Zod schema created with z.object({ ... }) or a transform/pipe wrapping one.'
    )
  }

  // Handle pipes (extract input schema) and transforms
  if (def.type === 'pipe') {
    // For schema.transform(fn), the source object is in def.in
    // For schema.pipe(other), we want the input schema in def.in
    // For z.preprocess(fn, schema), the target object is in def.out
    // Check if def.in has shape first (transform or explicit pipe case)
    if (def.in && typeof def.in === 'object' && 'shape' in def.in) {
      return def.in as ObjectFromSchema<Schema>
    }

    // Check if def.out has shape (simple preprocess case)
    if (def.out && typeof def.out === 'object' && 'shape' in def.out) {
      return def.out as ObjectFromSchema<Schema>
    }

    // For chained transforms, recurse into def.in (the previous pipe)
    // For nested preprocess, recurse into def.out
    const innerDef = getZodDef(def.in)
    if (innerDef?.type === 'pipe') {
      return objectFromSchema(def.in as Schema)
    }

    // Otherwise recurse into def.out (nested preprocess case)
    return objectFromSchema(def.out as Schema)
  }

  if (def.type === 'transform') {
    // Transforms don't have an inner schema in Zod 4, this shouldn't happen
    throw new Error(
      'Unexpected standalone transform encountered.\n' +
        'In Zod 4+, transforms are represented as pipes internally.\n' +
        'This error indicates an unexpected internal state that should not normally occur.\n' +
        'Please report this as a bug at https://github.com/SeasonedSoftware/remix-forms/issues with your schema definition.'
    )
  }

  // For other wrapper types, recurse
  if (def.innerType) {
    return objectFromSchema(def.innerType as Schema)
  }

  throw new Error(
    `Cannot extract object schema from Zod type: ${def.type}\nremix-forms requires an object schema (z.object({ ... })) to generate form fields.\nTransforms and pipes work only if they wrap an underlying object schema.\nReceived schema type "${def.type}" which cannot be used for form generation.\nConsider wrapping your schema in z.object() or using .pipe() to transform an object schema.`
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

export {
  objectFromSchema,
  mapObject,
  parseDate,
  browser,
  getZodDef,
  getZodValues,
}

export type {
  AnyZodObject,
  FormSchema,
  ObjectFromSchema,
  ComponentOrTagName,
  KeysOfStrings,
  ZodInternalDef,
}
