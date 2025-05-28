import type { SomeZodObject } from './adapters/zod3'
import type { RenderFieldProps } from './schema-form'

function defaultRenderField<Schema extends SomeZodObject>({
  Field,
  name,
  ...props
}: RenderFieldProps<Schema>) {
  return <Field key={String(name)} name={name} {...props} />
}

export { defaultRenderField }
