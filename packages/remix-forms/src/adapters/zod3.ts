import { zodResolver } from '@hookform/resolvers/zod'
import type { ZodTypeAny } from 'zod'
import { shapeInfo } from '../shape-info'
import type { SchemaAdapter } from './adapter'

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
}

export { zod3Adapter }
