import type { ZodTypeAny } from 'zod'

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

  // Zod 4: Access internals via _zod.def instead of _def
  // biome-ignore lint/suspicious/noExplicitAny: Zod internal structure is not typed
  const def = (shape as any)._zod?.def
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
    return shapeInfo(def.in, optional, nullable, getDefaultValue, enumValues)
  }

  if (type === 'optional') {
    return shapeInfo(def.innerType, true, nullable, getDefaultValue, enumValues)
  }

  if (type === 'nullable') {
    return shapeInfo(def.innerType, optional, true, getDefaultValue, enumValues)
  }

  if (type === 'default') {
    return shapeInfo(
      def.innerType,
      optional,
      nullable,
      () => def.defaultValue,
      enumValues
    )
  }

  if (type === 'enum') {
    // In Zod 4, enum values are available on _zod.values (Set)
    // biome-ignore lint/suspicious/noExplicitAny: Zod internal structure is not typed
    const values = Array.from((shape as any)._zod?.values || []) as string[]
    return {
      typeName: 'ZodEnum',
      optional,
      nullable,
      getDefaultValue,
      enumValues: values,
    }
  }

  // Map Zod 4 type strings to our ZodTypeName format
  const typeNameMap: Record<string, ZodTypeName> = {
    string: 'ZodString',
    number: 'ZodNumber',
    boolean: 'ZodBoolean',
    date: 'ZodDate',
    enum: 'ZodEnum',
  }

  const typeName = typeNameMap[type] || null

  return { typeName, optional, nullable, getDefaultValue, enumValues }
}

export { shapeInfo }
export type { ZodTypeName, ShapeInfo }
