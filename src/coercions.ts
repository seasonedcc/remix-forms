import { ZodTypeAny } from 'zod'
import { shapeInfo } from './shapeInfo'

function makeCoercion<T>(
  coercion: (value: FormDataEntryValue | null) => T,
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
const coerceBoolean = makeCoercion(Boolean, null)

function coerceValue(value: FormDataEntryValue | null, shape: ZodTypeAny) {
  const { typeName, optional, nullable } = shapeInfo(shape)

  if (typeName === 'ZodBoolean') {
    return coerceBoolean({ value, optional, nullable })
  }

  if (typeName === 'ZodNumber') {
    return coerceNumber({ value, optional, nullable })
  }

  if (typeName === 'ZodString' || typeName === 'ZodEnum') {
    return coerceString({ value, optional, nullable })
  }

  return value
}

export { coerceValue, coerceNumber, coerceBoolean, coerceString }
