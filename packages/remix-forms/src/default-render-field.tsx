import type { DefaultComponents } from './defaults'
import type { FormSchema } from './prelude'
import type { RenderFieldProps } from './schema-form'

function defaultRenderField<
  Schema extends FormSchema,
  // biome-ignore lint/suspicious/noExplicitAny: resolved map varies per call site
  Resolved extends Record<string, any> = DefaultComponents,
>({ Field, name, ...props }: RenderFieldProps<Schema, Resolved>) {
  return <Field key={String(name)} name={name} {...props} />
}

export { defaultRenderField }
