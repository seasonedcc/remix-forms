import { ZodTypeAny } from 'zod'

type ZodTypeName = 'ZodString' | 'ZodNumber' | 'ZodBoolean' | 'ZodEnum'

type ShapeInfo = {
  typeName: ZodTypeName | null
  optional: boolean
  nullable: boolean
  getDefaultValue?: () => unknown
}

function shapeInfo(
  shape?: ZodTypeAny,
  optional = false,
  nullable = false,
  getDefaultValue?: ShapeInfo['getDefaultValue'],
): ShapeInfo {
  if (!shape) return { typeName: null, optional, nullable, getDefaultValue }

  const typeName = shape._def.typeName

  if (typeName === 'ZodOptional') {
    return shapeInfo(shape._def.innerType, true, nullable, getDefaultValue)
  } else if (typeName === 'ZodNullable') {
    return shapeInfo(shape._def.innerType, optional, true, getDefaultValue)
  } else if (typeName === 'ZodDefault') {
    return shapeInfo(
      shape._def.innerType,
      optional,
      nullable,
      shape._def.defaultValue,
    )
  }

  return { typeName, optional, nullable, getDefaultValue }
}

export { shapeInfo }
export type { ZodTypeName, ShapeInfo }
