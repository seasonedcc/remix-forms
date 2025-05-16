import type { QueryStringRecord } from 'composable-functions'
import type { ZodTypeAny } from 'zod'
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
const coerceBoolean = makeCoercion(Boolean, false)

const coerceDate = makeCoercion((value) => {
  if (typeof value !== 'string') return null

  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) {
    const [date, time] = value.split("T")
    const [year, month, day] = date.split("-").map(Number)
    const [hour, minute] = time.split(":").map(Number)
    return new Date(year, month - 1, day, hour, minute)
  }

  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}, null)

function coerceValue(value: Value, shape?: ZodTypeAny) {
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
