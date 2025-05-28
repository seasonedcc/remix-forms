/**
 * Extracts information about a schema and provides a resolver for React Hook Form.
 *
 * Implementations adapt validation libraries so that {@link SchemaForm}
 * can work with different schema types.
 */
import type { Resolver } from 'react-hook-form'

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

export type { SchemaAdapter, FieldInfo, FieldTypeName }
