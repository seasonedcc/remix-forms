import type { ComponentSlots } from './defaults'
import type { FormSchema, Infer } from './prelude'
import type {
  RenderArrayArrayItemProps,
  RenderArrayFieldProps,
  RenderObjectArrayItemProps,
  RenderObjectFieldProps,
  RenderScalarArrayItemProps,
  RenderScalarFieldProps,
} from './schema-form'

function defaultRenderScalarField<
  Schema extends FormSchema,
  Resolved extends ComponentSlots,
  Multiline extends ReadonlyArray<keyof Infer<Schema>>,
  Radio extends ReadonlyArray<keyof Infer<Schema>>,
  Hidden extends ReadonlyArray<keyof Infer<Schema>>,
>({
  Field,
  name,
  ...props
}: RenderScalarFieldProps<Schema, Resolved, Multiline, Radio, Hidden>) {
  // biome-ignore lint/suspicious/noExplicitAny: Resolved is generic here — type safety is enforced at the call site
  return <Field key={String(name)} name={name} {...(props as any)} />
}

function defaultRenderArrayField<
  Schema extends FormSchema,
  Resolved extends ComponentSlots,
  Multiline extends ReadonlyArray<keyof Infer<Schema>>,
  Radio extends ReadonlyArray<keyof Infer<Schema>>,
  Hidden extends ReadonlyArray<keyof Infer<Schema>>,
>({
  Field,
  name,
  ...props
}: RenderArrayFieldProps<Schema, Resolved, Multiline, Radio, Hidden>) {
  // biome-ignore lint/suspicious/noExplicitAny: Resolved is generic here — type safety is enforced at the call site
  return <Field key={String(name)} name={name} {...(props as any)} />
}

function defaultRenderObjectField<
  Schema extends FormSchema,
  Resolved extends ComponentSlots,
  Multiline extends ReadonlyArray<keyof Infer<Schema>>,
  Radio extends ReadonlyArray<keyof Infer<Schema>>,
  Hidden extends ReadonlyArray<keyof Infer<Schema>>,
>({
  Field,
  name,
  ...props
}: RenderObjectFieldProps<Schema, Resolved, Multiline, Radio, Hidden>) {
  // biome-ignore lint/suspicious/noExplicitAny: Resolved is generic here — type safety is enforced at the call site
  return <Field key={String(name)} name={name} {...(props as any)} />
}

function defaultRenderScalarArrayItem<Resolved extends ComponentSlots>({
  Item,
  itemKey,
}: RenderScalarArrayItemProps<Resolved>) {
  return <Item key={itemKey} />
}

function defaultRenderObjectArrayItem<Resolved extends ComponentSlots>({
  Item,
  itemKey,
}: RenderObjectArrayItemProps<Resolved>) {
  return <Item key={itemKey} />
}

function defaultRenderArrayArrayItem<Resolved extends ComponentSlots>({
  Item,
  itemKey,
}: RenderArrayArrayItemProps<Resolved>) {
  return <Item key={itemKey} />
}

export {
  defaultRenderArrayArrayItem,
  defaultRenderArrayField,
  defaultRenderObjectArrayItem,
  defaultRenderObjectField,
  defaultRenderScalarArrayItem,
  defaultRenderScalarField,
}
