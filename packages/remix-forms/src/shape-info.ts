import type { ZodType } from 'zod'
import { getZodDef, getZodValues } from './prelude.js'

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
  shape?: ZodType,
  optional = false,
  nullable = false,
  getDefaultValue?: ShapeInfo['getDefaultValue'],
  enumValues?: ShapeInfo['enumValues']
): ShapeInfo {
  if (!shape) {
    return { typeName: null, optional, nullable, getDefaultValue, enumValues }
  }

  const def = getZodDef(shape)

  if (!def) {
    return { typeName: null, optional, nullable, getDefaultValue, enumValues }
  }

  const type = def.type

  // Handle transforms and pipes (replaces ZodEffects from Zod 3)
  if (type === 'transform') {
    // ZodTransform doesn't have an inner schema, skip it
    return { typeName: null, optional, nullable, getDefaultValue, enumValues }
  }

  if (type === 'pipe') {
    // For pipes, extract the input schema
    return shapeInfo(
      def.in as ZodType,
      optional,
      nullable,
      getDefaultValue,
      enumValues
    )
  }

  if (type === 'optional') {
    return shapeInfo(
      def.innerType as ZodType,
      true,
      nullable,
      getDefaultValue,
      enumValues
    )
  }

  if (type === 'nullable') {
    return shapeInfo(
      def.innerType as ZodType,
      optional,
      true,
      getDefaultValue,
      enumValues
    )
  }

  if (type === 'default') {
    return shapeInfo(
      def.innerType as ZodType,
      optional,
      nullable,
      () => def.defaultValue,
      enumValues
    )
  }

  if (type === 'enum') {
    const values = Array.from(getZodValues(shape) || []) as string[]
    return {
      typeName: 'ZodEnum',
      optional,
      nullable,
      getDefaultValue,
      enumValues: values,
    }
  }

  const typeNameMap: Record<string, ZodTypeName> = {
    string: 'ZodString',
    number: 'ZodNumber',
    boolean: 'ZodBoolean',
    date: 'ZodDate',
    enum: 'ZodEnum',
  }

  if (
    typeNameMap[type] === undefined &&
    process.env.NODE_ENV !== 'production'
  ) {
    console.warn(
      `remix-forms: Unknown Zod type "${type}". Falling back to null.`
    )
  }

  const typeName = typeNameMap[type] ?? null

  return { typeName, optional, nullable, getDefaultValue, enumValues }
}

export { shapeInfo }
export type { ZodTypeName, ShapeInfo }
