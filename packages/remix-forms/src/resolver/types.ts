import type { StandardSchemaV1 } from '@standard-schema/spec'
import type {
  FieldValues,
  ResolverOptions,
  ResolverResult,
} from 'react-hook-form'

export type Resolver = <T extends StandardSchemaV1>(
  schema: T
) => <TFieldValues extends FieldValues, TContext>(
  values: TFieldValues,
  context: TContext | undefined,
  options: ResolverOptions<TFieldValues>
) => Promise<ResolverResult<TFieldValues>>
