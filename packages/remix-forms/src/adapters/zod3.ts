import { zodResolver } from '@hookform/resolvers/zod'
import type * as z from 'zod'
import type { FieldInfo, FieldTypeName, SchemaAdapter } from './adapter'

type SomeZodObject = z.SomeZodObject
type ZodTypeAny = z.ZodTypeAny

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

  const zodTypeName = shape._def.typeName as
    | ZodTypeName
    | 'ZodEffects'
    | 'ZodOptional'
    | 'ZodNullable'
    | 'ZodDefault'
  const typeNameMap: Record<ZodTypeName, FieldTypeName> = {
    ZodString: 'string',
    ZodNumber: 'number',
    ZodBoolean: 'boolean',
    ZodDate: 'date',
    ZodEnum: 'enum',
  }
  const typeName = typeNameMap[zodTypeName as ZodTypeName] ?? null

  if (zodTypeName === 'ZodEffects') {
    return shapeInfo(
      shape._def.schema,
      optional,
      nullable,
      getDefaultValue,
      enumValues
    )
  }

  if (zodTypeName === 'ZodOptional') {
    return shapeInfo(
      shape._def.innerType,
      true,
      nullable,
      getDefaultValue,
      enumValues
    )
  }

  if (zodTypeName === 'ZodNullable') {
    return shapeInfo(
      shape._def.innerType,
      optional,
      true,
      getDefaultValue,
      enumValues
    )
  }

  if (zodTypeName === 'ZodDefault') {
    return shapeInfo(
      shape._def.innerType,
      optional,
      nullable,
      shape._def.defaultValue,
      enumValues
    )
  }

  if (zodTypeName === 'ZodEnum') {
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
