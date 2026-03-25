import type { FormSchema, Infer } from './prelude'
import type { RenderFormProps } from './schema-form'

function defaultRenderForm<
  Schema extends FormSchema,
  // biome-ignore lint/suspicious/noExplicitAny: resolved map varies per call site
  Resolved extends Record<string, any>,
  Multiline extends ReadonlyArray<keyof Infer<Schema>>,
  Radio extends ReadonlyArray<keyof Infer<Schema>>,
  Hidden extends ReadonlyArray<keyof Infer<Schema>>,
>({
  Fields,
  Errors,
  Button,
}: RenderFormProps<Schema, Resolved, Multiline, Radio, Hidden>) {
  return (
    <>
      <Fields />
      <Errors />
      <Button />
    </>
  )
}

export { defaultRenderForm }
