import type { AnyZodObject } from './prelude'
import type { RenderFieldProps } from './schema-form'

function defaultRenderField<Schema extends AnyZodObject>({
  Field,
  name,
  ...props
}: RenderFieldProps<Schema>) {
  return <Field key={String(name)} name={name} {...props} />
}

export { defaultRenderField }
