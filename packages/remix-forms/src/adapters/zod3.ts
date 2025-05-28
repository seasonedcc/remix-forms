import { zodResolver } from '@hookform/resolvers/zod'
import type { SomeZodObject, ZodTypeAny } from 'zod'
import type { FieldInfo, SchemaAdapter } from './adapter'

type ZodTypeName =
  | 'ZodString'
  | 'ZodNumber'
  | 'ZodBoolean'
  | 'ZodDate'
  | 'ZodEnum'

function shapeInfo(
  shape?: ZodTypeAny,
  optional = false,
  nullable = false,
  getDefaultValue?: FieldInfo['getDefaultValue'],
  enumValues?: FieldInfo['enumValues']
): FieldInfo {
  if (!shape) {
    return { typeName: null, optional, nullable, getDefaultValue, enumValues }
  }

  const typeName = shape._def.typeName as
    | ZodTypeName
    | 'ZodEffects'
    | 'ZodOptional'
    | 'ZodNullable'
    | 'ZodDefault'

  if (typeName === 'ZodEffects') {
    return shapeInfo(
      shape._def.schema,
      optional,
      nullable,
      getDefaultValue,
      enumValues
    )
  }

  if (typeName === 'ZodOptional') {
    return shapeInfo(
      shape._def.innerType,
      true,
      nullable,
      getDefaultValue,
      enumValues
    )
  }

  if (typeName === 'ZodNullable') {
    return shapeInfo(
      shape._def.innerType,
      optional,
      true,
      getDefaultValue,
      enumValues
    )
  }

  if (typeName === 'ZodDefault') {
    return shapeInfo(
      shape._def.innerType,
      optional,
      nullable,
      shape._def.defaultValue,
      enumValues
    )
  }

  if (typeName === 'ZodEnum') {
    return {
      typeName,
      optional,
      nullable,
      getDefaultValue,
      enumValues: shape._def.values,
    }
  }

  return { typeName, optional, nullable, getDefaultValue, enumValues }
}

function unwrapObject(schema: SomeZodObject | ZodTypeAny): SomeZodObject {
  return 'shape' in schema
    ? (schema as SomeZodObject)
    : unwrapObject((schema as ZodTypeAny)._def.schema)
}

/**
 * Adapter for Zod version 3 schemas.
 *
 * This object implements {@link SchemaAdapter} for `zod` and exposes
 * helper functions to integrate Zod schemas with {@link SchemaForm}.
 */
const zod3Adapter: SchemaAdapter = {
  resolver(schema) {
    return zodResolver(schema as ZodTypeAny)
  },
  getFieldInfo(shape) {
    return shapeInfo(shape as ZodTypeAny)
  },
  objectFromSchema(schema) {
    return unwrapObject(schema as ZodTypeAny)
  },
}

export { zod3Adapter }
export type { ZodTypeName }
