import type { FormSchema, Infer } from './prelude'
import type { RenderFieldProps } from './schema-form'

function defaultRenderField<
  Schema extends FormSchema,
  // biome-ignore lint/suspicious/noExplicitAny: resolved map varies per call site
  Resolved extends Record<string, any>,
  Multiline extends ReadonlyArray<keyof Infer<Schema>>,
  Radio extends ReadonlyArray<keyof Infer<Schema>>,
>({
  Field,
  name,
  ...props
}: RenderFieldProps<Schema, Resolved, Multiline, Radio>) {
  return <Field key={String(name)} name={name} {...props} />
}

export { defaultRenderField }
