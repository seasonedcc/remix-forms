import type { SchemaObject } from './adapters/adapter'
import type { RenderFieldProps } from './schema-form'

function defaultRenderField<Schema extends SchemaObject>({
  Field,
  name,
  ...props
}: RenderFieldProps<Schema>) {
  return <Field key={String(name)} name={name} {...props} />
}

export { defaultRenderField }
