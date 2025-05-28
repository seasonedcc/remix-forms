/**
 * Extracts information about a schema and provides a resolver for React Hook Form.
 *
 * Implementations adapt validation libraries so that {@link SchemaForm}
 * can work with different schema types.
 */
import type { Resolver } from 'react-hook-form'

/**
 * Generic representation of an object schema.
 *
 * Validation adapters should map this to the concrete type used by
 * their underlying library.
 */
// biome-ignore lint/suspicious/noExplicitAny: library agnostic typing
type SchemaObject = Record<string, any>

/**
 * Generic representation of any schema value.
 */
// biome-ignore lint/suspicious/noExplicitAny: library agnostic typing
type SchemaType = any

/**
 * Namespace used for type inference.
 *
 * Adapters may augment this namespace via declaration merging to provide
 * stronger typing based on their validation library.
 */
declare namespace schema {
  // biome-ignore lint/suspicious/noExplicitAny: generic inference placeholder
  // biome-ignore lint/correctness/noUnusedVariables: generic parameter for inference
  export type infer<T> = any
  // biome-ignore lint/correctness/noUnusedVariables: generic placeholder type
  export interface Effects<T> extends Record<string, never> {
    // adapter specific data may use T via declaration merging
  }
}

/**
 * Definition describing a single field in a schema.
 */
type FieldTypeName = 'string' | 'number' | 'boolean' | 'date' | 'enum'

type FieldInfo = {
  typeName: FieldTypeName | null
  optional: boolean
  nullable: boolean
  getDefaultValue?: () => unknown
  enumValues?: string[]
}

/**
 * Adapter interface for integrating validation libraries.
 */
interface SchemaAdapter {
  /**
   * Create a resolver understood by `react-hook-form`.
   *
   * @param schema - Validation schema to resolve
   * @returns Resolver used by `useForm`
   */
  resolver(schema: unknown): Resolver
  /**
   * Get metadata about a schema field.
   *
   * @param shape - Schema node describing a field
   * @returns Extracted field information
   */
  getFieldInfo(shape?: unknown): FieldInfo
  /**
   * Extract the object schema describing field shapes.
   */
  objectFromSchema(schema: unknown): { shape: Record<string, unknown> }
}

export type {
  SchemaAdapter,
  FieldInfo,
  FieldTypeName,
  SchemaObject,
  SchemaType,
}
export { schema }
