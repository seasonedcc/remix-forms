import type { FormSchema, Infer } from './prelude'
import type { RenderFieldProps } from './schema-form'

function defaultRenderField<
  Schema extends FormSchema,
  // biome-ignore lint/suspicious/noExplicitAny: resolved map varies per call site
  Resolved extends Record<string, any>,
  Multiline extends ReadonlyArray<keyof Infer<Schema>>,
  Radio extends ReadonlyArray<keyof Infer<Schema>>,
  Hidden extends ReadonlyArray<keyof Infer<Schema>>,
>({
  Field,
  name,
  ...props
}: RenderFieldProps<Schema, Resolved, Multiline, Radio, Hidden>) {
  // biome-ignore lint/suspicious/noExplicitAny: Resolved is generic here — type safety is enforced at the call site
  return <Field key={String(name)} name={name} {...(props as any)} />
}

export { defaultRenderField }
