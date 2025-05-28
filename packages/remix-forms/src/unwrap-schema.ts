import type { ZodTypeAny } from 'zod/v4'

function unwrapSchema<T extends ZodTypeAny>(schema: T): ZodTypeAny {
  let current: ZodTypeAny = schema

  while (current) {
    const { typeName } = current._def

    if (
      typeName === 'ZodOptional' ||
      typeName === 'ZodNullable' ||
      typeName === 'ZodDefault'
    ) {
      current = current._def.innerType
      continue
    }

    if (typeName === 'ZodEffects') {
      current = current._def.schema
      continue
    }

    if (typeName === 'ZodPipe') {
      const inSchema = unwrapSchema(current._def.in)
      if (inSchema._def.typeName === 'ZodTransform') {
        current = current._def.out
      } else {
        current = current._def.in
      }
      continue
    }

    break
  }

  return current
}

export { unwrapSchema }
