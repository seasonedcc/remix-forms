import type { ZodObject } from 'zod'
import type { RenderFieldProps } from './schema-form'

// biome-ignore lint/suspicious/noExplicitAny: Generic constraint requires any for Zod type flexibility
function defaultRenderField<Schema extends ZodObject<any>>({
  Field,
  name,
  ...props
}: RenderFieldProps<Schema>) {
  return <Field key={String(name)} name={name} {...props} />
}

export { defaultRenderField }
