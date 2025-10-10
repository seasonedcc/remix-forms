import type {
  FieldValues,
  ResolverOptions,
  ResolverResult,
} from 'react-hook-form'
import type { z } from 'zod'

export type Resolver = <T extends z.ZodType>(
  schema: T,
  schemaOptions?: z.core.ParseContext<z.core.$ZodIssue>,
  factoryOptions?: {
    mode?: 'async' | 'sync'
    raw?: boolean
  }
) => <TFieldValues extends FieldValues, TContext>(
  values: TFieldValues,
  context: TContext | undefined,
  options: ResolverOptions<TFieldValues>
) => Promise<ResolverResult<TFieldValues>>
