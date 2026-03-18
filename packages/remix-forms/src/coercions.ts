import type { FormValue } from 'coerce-form-data'
import { coerceValue as coerceFormValue } from 'coerce-form-data'
import type { ZodType } from 'zod'
import { shapeInfo, toFieldDescriptor } from './shape-info'

function coerceValue(value: unknown, shape?: ZodType) {
  if (!shape) return coerceFormValue(value as FormValue)
  return coerceFormValue(
    value as FormValue,
    toFieldDescriptor(shapeInfo(shape))
  )
}

export { coerceValue }
