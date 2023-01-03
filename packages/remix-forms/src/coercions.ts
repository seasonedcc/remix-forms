import type { inputFromForm } from 'domain-functions'
import type { ZodTypeAny } from 'zod'
import { parseDate } from './prelude'
import type { ShapeInfo } from './shapeInfo'
import { shapeInfo } from './shapeInfo'

type ParsedQs = Awaited<ReturnType<typeof inputFromForm>>

type Value =
  | FormDataEntryValue
  | ParsedQs
  | ParsedQs[]
  | string[]
  | null
  | undefined

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

function coerceToForm(value: unknown, shape: ShapeInfo) {
  const { typeName } = shape
  if (typeName === 'ZodBoolean') {
    return Boolean(value) ?? false
  }

  if (typeName === 'ZodDate') {
    return parseDate(value as Date | undefined)
  }

  return String(value ?? '')
}

export { coerceValue, coerceToForm }
