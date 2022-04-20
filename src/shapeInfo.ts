import { ZodTypeAny } from 'zod'

type ZodTypeName = 'ZodString' | 'ZodNumber' | 'ZodBoolean' | 'ZodEnum'

type ShapeInfo = {
  typeName: ZodTypeName | null
  optional: boolean
  nullable: boolean
}

function shapeInfo(
  shape?: ZodTypeAny,
  optional = false,
  nullable = false,
): ShapeInfo {
  if (!shape) return { typeName: null, optional, nullable }

  const typeName = shape._def.typeName

  if (typeName === 'ZodOptional') {
    return shapeInfo(shape._def.innerType, true, nullable)
  } else if (typeName === 'ZodNullable') {
    return shapeInfo(shape._def.innerType, optional, true)
  }

  return { typeName, optional, nullable }
}

export { shapeInfo }
export type { ZodTypeName, ShapeInfo }
