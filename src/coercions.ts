import { ZodTypeAny } from 'zod'
import { shapeInfo } from './shapeInfo'

function makeCoercion<T>(coercion: (value: FormDataEntryValue | null) => T) {
  return ({
    value,
    optional,
    nullable,
  }: {
    value: FormDataEntryValue | null
    optional: boolean
    nullable: boolean
  }) =>
    value ? coercion(value) : nullable ? null : optional ? undefined : value
}

const coerceString = makeCoercion(String)
const coerceNumber = makeCoercion(Number)
const coerceBoolean = makeCoercion(Boolean)

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
