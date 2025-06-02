import type { FieldInfo } from './adapters/adapter'
/**
 * Coerce values into a representation suitable for HTML form inputs.
 *
 * @param value - Raw value coming from props or defaults
 * @param shape - Metadata describing the field type
 * @returns Value formatted for use as a form field default
 */
import { parseDate } from './prelude'

function coerceToForm(value: unknown, info: FieldInfo) {
  const { typeName } = info
  if (typeName === 'boolean') {
    return Boolean(value) ?? false
  }

  if (typeName === 'date') {
    return parseDate(value as Date | undefined)
  }

  if (typeName === 'enum' || typeName === 'string' || typeName === 'number') {
    return String(value ?? '')
  }

  return value ?? ''
}

export { coerceToForm }
