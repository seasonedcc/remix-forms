import { coerceValue } from './coerce-value'
import type { FieldDescriptors, FormRecord, FormValue } from './types'

/**
 * Coerce every field in a {@link FormData} or plain record according to a
 * map of {@link FieldDescriptors}.
 *
 * Only the keys present in `fields` are included in the result.
 *
 * @param data - A web standard {@link FormData} or a plain key/value record
 * @param fields - Map of field names to their type descriptors
 * @returns A new object with every value coerced to its declared type
 *
 * @example
 * ```ts
 * const fd = new FormData()
 * fd.set('name', 'Jane')
 * fd.set('age', '30')
 *
 * coerceFormData(fd, {
 *   name: { type: 'string' },
 *   age: { type: 'number' },
 * })
 * // { name: 'Jane', age: 30 }
 * ```
 *
 * @example
 * ```ts
 * coerceFormData(
 *   { agree: 'on', count: '5' },
 *   { agree: { type: 'boolean' }, count: { type: 'number' } },
 * )
 * // { agree: true, count: 5 }
 * ```
 */
function coerceFormData(
  data: FormData | FormRecord,
  fields: FieldDescriptors
): Record<string, unknown> {
  const result: Record<string, unknown> = {}

  for (const key in fields) {
    const raw: FormValue = data instanceof FormData ? data.get(key) : data[key]
    result[key] = coerceValue(raw ?? null, fields[key])
  }

  return result
}

export { coerceFormData }
