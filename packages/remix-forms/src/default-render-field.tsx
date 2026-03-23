import type { ComponentMap } from './defaults'
import type { FormSchema } from './prelude'
import type { RenderFieldProps } from './schema-form'

function defaultRenderField<
  Schema extends FormSchema,
  // biome-ignore lint/complexity/noBannedTypes: generic default for optional Components parameter
  Components extends Partial<ComponentMap> = {},
>({ Field, name, ...props }: RenderFieldProps<Schema, Components>) {
  return <Field key={String(name)} name={name} {...props} />
}

export { defaultRenderField }
