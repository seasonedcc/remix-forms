import type { QueryStringRecord } from 'composable-functions'
import type { ZodType } from 'zod'
import { shapeInfo } from './shape-info'

type QsValue = QueryStringRecord[keyof QueryStringRecord]
type Value = FormDataEntryValue | QsValue | null

function makeCoercion<T>(coercion: (value: Value) => T, emptyValue: unknown) {
  return ({
    value,
    optional,
    nullable,
  }: {
    value: Value
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

function coerceValue(value: Value, shape?: ZodType) {
  const { typeName, optional, nullable } = shapeInfo(shape)

  if (typeName === 'ZodBoolean') {
    return coerceBoolean({ value, optional, nullable })
  }

  if (typeName === 'ZodNumber') {
    return coerceNumber({ value, optional, nullable })
  }

  if (typeName === 'ZodDate') {
    return coerceDate({ value, optional, nullable })
  }

  if (typeName === 'ZodString' || typeName === 'ZodEnum') {
    return coerceString({ value, optional, nullable })
  }

  return value
}

export { coerceValue }
