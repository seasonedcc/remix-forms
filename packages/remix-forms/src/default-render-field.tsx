import type { FormSchema } from './prelude'
import type { RenderFieldProps } from './schema-form'

function defaultRenderField<Schema extends FormSchema>({
  Field,
  name,
  ...props
}: RenderFieldProps<Schema>) {
  return <Field key={String(name)} name={name} {...props} />
}

export { defaultRenderField }
