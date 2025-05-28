import type { ZodTypeAny } from 'zod/v4'
import { getZodDef } from './get-zod-def'

type ZodTypeName =
  | 'ZodString'
  | 'ZodNumber'
  | 'ZodBoolean'
  | 'ZodDate'
  | 'ZodEnum'

type ShapeInfo = {
  typeName: ZodTypeName | null
  optional: boolean
  nullable: boolean
  getDefaultValue?: () => unknown
  enumValues?: string[]
}

function shapeInfo(
  shape?: ZodTypeAny,
  optional = false,
  nullable = false,
  getDefaultValue?: ShapeInfo['getDefaultValue'],
  enumValues?: ShapeInfo['enumValues']
): ShapeInfo {
  if (!shape) {
    return { typeName: null, optional, nullable, getDefaultValue, enumValues }
  }

  const def = getZodDef(shape)
  const typeName = def.typeName

  if (typeName === 'ZodEffects') {
    return shapeInfo(
      def.schema,
      optional,
      nullable,
      getDefaultValue,
      enumValues
    )
  }

  if (typeName === 'ZodPipeline') {
    return shapeInfo(def.out, optional, nullable, getDefaultValue, enumValues)
  }

  if (typeName === 'ZodOptional') {
    return shapeInfo(def.innerType, true, nullable, getDefaultValue, enumValues)
  }

  if (typeName === 'ZodNullable') {
    return shapeInfo(def.innerType, optional, true, getDefaultValue, enumValues)
  }

  if (typeName === 'ZodDefault') {
    return shapeInfo(
      def.innerType,
      optional,
      nullable,
      def.defaultValue,
      enumValues
    )
  }

  if (typeName === 'ZodEnum') {
    return {
      typeName,
      optional,
      nullable,
      getDefaultValue,
      enumValues: def.values,
    }
  }

  return { typeName, optional, nullable, getDefaultValue, enumValues }
}

export { shapeInfo }
export type { ZodTypeName, ShapeInfo }
