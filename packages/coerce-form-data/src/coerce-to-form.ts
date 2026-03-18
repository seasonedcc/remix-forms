import { parseDate } from './parse-date'
import type { FieldDescriptor } from './types'

/**
 * Coerce a typed value into a representation suitable for HTML form inputs.
 *
 * This is the reverse of {@link coerceValue}: it takes an already-typed
 * JavaScript value and converts it into the string (or boolean) that an
 * HTML input element expects.
 *
 * @param value - The typed value to format
 * @param field - Descriptor declaring the field type
 * @returns A value ready to be used as a form input's default
 *
 * @example
 * ```ts
 * coerceToForm(true, { type: 'boolean' })  // true
 * coerceToForm(42, { type: 'number' })     // '42'
 * coerceToForm(new Date('2024-05-06T12:00:00Z'), { type: 'date' })
 * // '2024-05-06'
 * ```
 */
function coerceToForm(value: unknown, field: FieldDescriptor) {
  const { type } = field

  if (type === 'boolean') {
    return Boolean(value) ?? false
  }

  if (type === 'date') {
    return parseDate(value as Date | undefined)
  }

  if (type === 'enum' || type === 'string' || type === 'number') {
    return String(value ?? '')
  }

  return value ?? ''
}

export { coerceToForm }
