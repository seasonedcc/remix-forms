import * as React from 'react'

/**
 * Describes the full set of component slots available for customisation.
 *
 * Every key maps to either a React component or an HTML tag name string.
 * Pass a partial map via the {@link SchemaFormProps.components | components}
 * prop to override only the slots you need.
 *
 * @example
 * ```tsx
 * const components = { input: MyInput, button: MyButton } satisfies Partial<ComponentMap>
 * ```
 */
type ComponentMap = {
  // biome-ignore lint/suspicious/noExplicitAny: component props are inferred via generics, not constrained here
  field: React.ComponentType<any> | string
  // biome-ignore lint/suspicious/noExplicitAny: component props are inferred via generics, not constrained here
  label: React.ComponentType<any> | string
  // biome-ignore lint/suspicious/noExplicitAny: component props are inferred via generics, not constrained here
  input: React.ComponentType<any> | string
  // biome-ignore lint/suspicious/noExplicitAny: component props are inferred via generics, not constrained here
  multiline: React.ComponentType<any> | string
  // biome-ignore lint/suspicious/noExplicitAny: component props are inferred via generics, not constrained here
  select: React.ComponentType<any> | string
  // biome-ignore lint/suspicious/noExplicitAny: component props are inferred via generics, not constrained here
  checkbox: React.ComponentType<any> | string
  // biome-ignore lint/suspicious/noExplicitAny: component props are inferred via generics, not constrained here
  radio: React.ComponentType<any> | string
  // biome-ignore lint/suspicious/noExplicitAny: component props are inferred via generics, not constrained here
  checkboxWrapper: React.ComponentType<any> | string
  // biome-ignore lint/suspicious/noExplicitAny: component props are inferred via generics, not constrained here
  radioWrapper: React.ComponentType<any> | string
  // biome-ignore lint/suspicious/noExplicitAny: component props are inferred via generics, not constrained here
  radioGroup: React.ComponentType<any> | string
  // biome-ignore lint/suspicious/noExplicitAny: component props are inferred via generics, not constrained here
  fieldErrors: React.ComponentType<any> | string
  // biome-ignore lint/suspicious/noExplicitAny: component props are inferred via generics, not constrained here
  error: React.ComponentType<any> | string
  // biome-ignore lint/suspicious/noExplicitAny: component props are inferred via generics, not constrained here
  fields: React.ComponentType<any> | string
  // biome-ignore lint/suspicious/noExplicitAny: component props are inferred via generics, not constrained here
  globalErrors: React.ComponentType<any> | string
  // biome-ignore lint/suspicious/noExplicitAny: component props are inferred via generics, not constrained here
  button: React.ComponentType<any> | string
}

const DefaultField = React.forwardRef<
  HTMLDivElement,
  JSX.IntrinsicElements['div']
>((props, ref) => <div {...props} ref={ref} />)

const DefaultLabel = React.forwardRef<
  HTMLLabelElement,
  JSX.IntrinsicElements['label']
  // biome-ignore lint/a11y/noLabelWithoutControl: wrapper component, association happens at render time
>((props, ref) => <label {...props} ref={ref} />)

const DefaultInput = React.forwardRef<
  HTMLInputElement,
  JSX.IntrinsicElements['input']
>((props, ref) => <input {...props} ref={ref} />)

const DefaultMultiline = React.forwardRef<
  HTMLTextAreaElement,
  JSX.IntrinsicElements['textarea']
>((props, ref) => <textarea {...props} ref={ref} />)

const DefaultSelect = React.forwardRef<
  HTMLSelectElement,
  JSX.IntrinsicElements['select']
>((props, ref) => <select {...props} ref={ref} />)

const DefaultCheckbox = React.forwardRef<
  HTMLInputElement,
  JSX.IntrinsicElements['input']
>((props, ref) => <input {...props} ref={ref} />)

const DefaultRadio = React.forwardRef<
  HTMLInputElement,
  JSX.IntrinsicElements['input']
>((props, ref) => <input {...props} ref={ref} />)

const DefaultRadioGroup = React.forwardRef<
  HTMLFieldSetElement,
  JSX.IntrinsicElements['fieldset']
>((props, ref) => <fieldset {...props} ref={ref} />)

const DefaultRadioWrapper = React.forwardRef<
  HTMLDivElement,
  JSX.IntrinsicElements['div']
>((props, ref) => <div {...props} ref={ref} />)

const DefaultCheckboxWrapper = React.forwardRef<
  HTMLDivElement,
  JSX.IntrinsicElements['div']
>((props, ref) => <div {...props} ref={ref} />)

const DefaultFieldErrors = React.forwardRef<
  HTMLDivElement,
  JSX.IntrinsicElements['div']
>((props, ref) => <div {...props} ref={ref} />)

const DefaultFieldError = React.forwardRef<
  HTMLDivElement,
  JSX.IntrinsicElements['div']
>((props, ref) => <div {...props} ref={ref} />)

const DefaultFieldsWrapper = React.forwardRef<
  HTMLDivElement,
  JSX.IntrinsicElements['div']
>((props, ref) => <div {...props} ref={ref} />)

const DefaultGlobalErrors = React.forwardRef<
  HTMLDivElement,
  JSX.IntrinsicElements['div']
>((props, ref) => <div {...props} ref={ref} />)

const DefaultButton = React.forwardRef<
  HTMLButtonElement,
  JSX.IntrinsicElements['button']
>((props, ref) => <button {...props} ref={ref} />)

type DefaultComponents = {
  field: typeof DefaultField
  label: typeof DefaultLabel
  input: typeof DefaultInput
  multiline: typeof DefaultMultiline
  select: typeof DefaultSelect
  checkbox: typeof DefaultCheckbox
  radio: typeof DefaultRadio
  checkboxWrapper: typeof DefaultCheckboxWrapper
  radioWrapper: typeof DefaultRadioWrapper
  radioGroup: typeof DefaultRadioGroup
  fieldErrors: typeof DefaultFieldErrors
  error: typeof DefaultFieldError
  fields: typeof DefaultFieldsWrapper
  globalErrors: typeof DefaultGlobalErrors
  button: typeof DefaultButton
}

const defaultComponents: DefaultComponents = {
  field: DefaultField,
  label: DefaultLabel,
  input: DefaultInput,
  multiline: DefaultMultiline,
  select: DefaultSelect,
  checkbox: DefaultCheckbox,
  radio: DefaultRadio,
  checkboxWrapper: DefaultCheckboxWrapper,
  radioWrapper: DefaultRadioWrapper,
  radioGroup: DefaultRadioGroup,
  fieldErrors: DefaultFieldErrors,
  error: DefaultFieldError,
  fields: DefaultFieldsWrapper,
  globalErrors: DefaultGlobalErrors,
  button: DefaultButton,
}

type ResolveComponents<Components extends Partial<ComponentMap>> = {
  [K in keyof DefaultComponents]: K extends keyof Components
    ? Components[K] extends undefined
      ? DefaultComponents[K]
      : NonNullable<Components[K]>
    : DefaultComponents[K]
}

type PropsOf<T> = T extends React.ComponentType<infer P>
  ? P
  : T extends keyof JSX.IntrinsicElements
    ? JSX.IntrinsicElements[T]
    : Record<string, unknown>

export type { ComponentMap, DefaultComponents, ResolveComponents, PropsOf }

export {
  DefaultField,
  DefaultLabel,
  DefaultInput,
  DefaultMultiline,
  DefaultSelect,
  DefaultCheckbox,
  DefaultRadio,
  DefaultRadioGroup,
  DefaultRadioWrapper,
  DefaultCheckboxWrapper,
  DefaultFieldErrors,
  DefaultFieldError,
  DefaultFieldsWrapper,
  DefaultGlobalErrors,
  DefaultButton,
  defaultComponents,
}
