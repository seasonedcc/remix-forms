import type { QueryStringRecord } from 'composable-functions'
import type { SchemaAdapter } from './adapters/adapter'
import { zod3Adapter } from './adapters/zod3'

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

  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}, null)

function coerceValue(
  value: Value,
  shape?: unknown,
  adapter: SchemaAdapter = zod3Adapter
) {
  const { typeName, optional, nullable } = adapter.getFieldInfo(shape)

  if (typeName === 'boolean') {
    return coerceBoolean({ value, optional, nullable })
  }

  if (typeName === 'number') {
    return coerceNumber({ value, optional, nullable })
  }

  if (typeName === 'date') {
    return coerceDate({ value, optional, nullable })
  }

  if (typeName === 'string' || typeName === 'enum') {
    return coerceString({ value, optional, nullable })
  }

  return value
}

export { coerceValue }
