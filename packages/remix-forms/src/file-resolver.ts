import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import type { SchemaInfo } from 'schema-info'
import type { FormSchema } from './prelude'

type StandardSchemaResolver = ReturnType<typeof standardSchemaResolver>

function makeFileResolver<Schema extends FormSchema>(
  schema: Schema,
  fields: Record<string, SchemaInfo>
): StandardSchemaResolver {
  const baseResolver = standardSchemaResolver(schema)

  return (formValues, ctx, opts) => {
    const transformed = { ...formValues }
    for (const key in fields) {
      if (fields[key].type === 'file') {
        const val = transformed[key]
        if (val instanceof File) continue
        if (val?.[0] instanceof File) transformed[key] = val[0]
        else transformed[key] = undefined
      }
    }
    return baseResolver(transformed, ctx, opts)
  }
}

export { makeFileResolver }
