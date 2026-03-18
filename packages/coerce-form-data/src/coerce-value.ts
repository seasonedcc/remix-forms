import type { FieldDescriptor, FormValue } from './types'

function makeCoercion<T>(
  coercion: (value: FormValue) => T,
  emptyValue: unknown
) {
  return ({
    value,
    optional,
    nullable,
  }: {
    value: FormValue
    optional: boolean
    nullable: boolean
  }) => {
    if (value) return coercion(value)
    if (nullable) return null
    if (optional) return undefined

    return emptyValue
  }
}

const coerceString = makeCoercion(String, '')
const coerceNumber = makeCoercion(Number, null)

const coerceBoolean = makeCoercion(
  (value) =>
    value === 'false' ? false : value === 'null' ? null : Boolean(value),
  false
)

const coerceDate = makeCoercion((value) => {
  if (typeof value !== 'string') return null

  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}, null)

/**
 * Coerce a raw form value into its typed JavaScript representation.
 *
 * When no {@link FieldDescriptor} is provided the value is returned as-is.
 * Pass a descriptor to convert the value according to its declared type —
 * for example turning a `"123"` string into the number `123`.
 *
 * @param value - The raw value from a form field or query string
 * @param field - Optional descriptor declaring the target type
 * @returns The coerced value
 *
 * @example
 * ```ts
 * coerceValue('42', { type: 'number' })   // 42
 * coerceValue('true', { type: 'boolean' }) // true
 * coerceValue('2024-05-06', { type: 'date' })
 * // Date(2024, 4, 6)
 * ```
 */
function coerceValue(value: FormValue, field?: FieldDescriptor) {
  if (!field) return value

  const { type, optional = false, nullable = false } = field

  if (type === 'boolean') {
    return coerceBoolean({ value, optional, nullable })
  }

  if (type === 'number') {
    return coerceNumber({ value, optional, nullable })
  }

  if (type === 'date') {
    return coerceDate({ value, optional, nullable })
  }

  if (type === 'string' || type === 'enum') {
    return coerceString({ value, optional, nullable })
  }

  return value
}

export { coerceValue }
