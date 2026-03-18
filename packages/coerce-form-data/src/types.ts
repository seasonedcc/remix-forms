/**
 * Supported field types for coercion.
 *
 * @example
 * ```ts
 * const type: FieldType = 'string'
 * ```
 */
type FieldType = 'string' | 'number' | 'boolean' | 'date' | 'enum'

/**
 * Schema-agnostic descriptor for a form field.
 *
 * Tells the coercion functions what type a field is and whether it accepts
 * `null` or `undefined` values. This is the only information needed to
 * convert between raw form strings and typed JavaScript values.
 *
 * @example
 * ```ts
 * const field: FieldDescriptor = { type: 'number', optional: true }
 * ```
 */
type FieldDescriptor = {
  type: FieldType | null
  optional?: boolean
  nullable?: boolean
}

/**
 * A raw value that can appear in form data.
 *
 * Covers the web standard {@link FormDataEntryValue} (string or File),
 * plain strings, string arrays (from parsed query strings), and missing
 * values.
 */
type FormValue = FormDataEntryValue | string | string[] | null | undefined

/**
 * A plain record of raw form values keyed by field name.
 *
 * @example
 * ```ts
 * const data: FormRecord = { name: 'Jane', age: '30' }
 * ```
 */
type FormRecord = Record<string, FormValue>

/**
 * A map of field names to their descriptors.
 *
 * @example
 * ```ts
 * const fields: FieldDescriptors = {
 *   name: { type: 'string' },
 *   age: { type: 'number', optional: true },
 * }
 * ```
 */
type FieldDescriptors = Record<string, FieldDescriptor>

export type {
  FieldType,
  FieldDescriptor,
  FormValue,
  FormRecord,
  FieldDescriptors,
}
