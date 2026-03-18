/**
 * Coerce values into a representation suitable for HTML form inputs.
 *
 * @param value - Raw value coming from props or defaults
 * @param shape - Metadata describing the field type
 * @returns Value formatted for use as a form field default
 */
import { coerceToForm as coerceToFormValue } from 'coerce-form-data'
import type { ShapeInfo } from './shape-info'
import { toFieldDescriptor } from './shape-info'

function coerceToForm(value: unknown, shape: ShapeInfo) {
  return coerceToFormValue(value, toFieldDescriptor(shape))
}

export { coerceToForm }
