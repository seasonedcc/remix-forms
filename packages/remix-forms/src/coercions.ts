import type { ZodTypeAny } from 'zod'
import { shapeInfo } from './shapeInfo'

function makeCoercion<T>(
  coercion: (value: FormDataEntryValue) => T,
  emptyValue: unknown,
) {
  return ({
    value,
    optional,
    nullable,
  }: {
    value: FormDataEntryValue | null
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
const coerceArrayOfStrings = makeCoercion((value) => {
  if (value === '') return [];
  return String(value).split(',').filter((v) => v !== '');
}, [])
const coerceArrayOfNumbers = makeCoercion((value) => {
  if (value === '') return [];
  if (value instanceof File) return [String(value)];
  return String(value).split(',').filter((v) => v !== '').map(Number).filter((v) => !isNaN(v));
}, [])

const coerceDate = makeCoercion((value) => {
  if (typeof value !== 'string') return null

  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}, null)

function coerceValue(value: FormDataEntryValue | null, shape?: ZodTypeAny) {
  const { typeName, innerTypeName,  optional, nullable } = shapeInfo(shape)
  
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

  if (typeName === 'ZodArray') {
    if (innerTypeName === 'ZodNumber') {
      return coerceArrayOfNumbers({ value, optional, nullable })
    }

    return coerceArrayOfStrings({ value, optional, nullable })
  }

  return value
}

export { coerceValue }
