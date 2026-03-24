import * as React from 'react'
import {
  Form as ReactRouterForm,
  type FormProps as ReactRouterFormProps,
} from 'react-router'

type ComponentFor<Props> = (props: Props) => React.ReactNode

type FormSlotProps = Pick<ReactRouterFormProps, 'method'> & {
  onSubmit?: React.FormEventHandler
  children?: React.ReactNode
}

type FieldSlotProps = {
  hidden?: boolean
  style?: React.CSSProperties
  children?: React.ReactNode
}

type LabelSlotProps = {
  id?: string
  htmlFor?: string
  children?: React.ReactNode
}

type InputSlotProps = {
  id?: string
  type?: string
  name?: string
  placeholder?: string
  autoFocus?: boolean
  autoComplete?: string
  defaultValue?: string | number | readonly string[]
}

type MultilineSlotProps = {
  id?: string
  name?: string
  placeholder?: string
  autoFocus?: boolean
  autoComplete?: string
  defaultValue?: string | number | readonly string[]
}

type SelectSlotProps = {
  id?: string
  name?: string
  autoFocus?: boolean
  autoComplete?: string
  defaultValue?: string | number | readonly string[]
  children?: React.ReactNode
}

type CheckboxSlotProps = {
  id?: string
  type?: string
  name?: string
  placeholder?: string
  autoFocus?: boolean
  defaultChecked?: boolean
}

type RadioSlotProps = {
  id?: string
  type?: string
  name?: string
  value?: string | number
  defaultChecked?: boolean
  autoFocus?: boolean
}

type RadioGroupSlotProps = { children?: React.ReactNode }

type WrapperSlotProps = { children?: React.ReactNode }

type ErrorContainerSlotProps = {
  id?: string
  role?: string
  children?: React.ReactNode
}

type ErrorSlotProps = { children?: React.ReactNode }

type FieldsSlotProps = { children?: React.ReactNode }

type ButtonSlotProps = {
  disabled?: boolean
  onClick?: React.MouseEventHandler
  children?: React.ReactNode
}

/**
 * Describes the full set of component slots available for customisation.
 *
 * Each slot is constrained to a component that accepts the minimum props
 * the library will pass at runtime. Pass a partial map via the
 * {@link SchemaFormProps.components | components} prop or
 * {@link makeSchemaForm} to override only the slots you need.
 *
 * @example
 * ```tsx
 * const components = { input: MyInput, button: MyButton } satisfies Partial<ComponentMap>
 * ```
 */
type ComponentMap = {
  form: ComponentFor<FormSlotProps>
  field: ComponentFor<FieldSlotProps>
  label: ComponentFor<LabelSlotProps>
  input: ComponentFor<InputSlotProps>
  multiline: ComponentFor<MultilineSlotProps>
  select: ComponentFor<SelectSlotProps>
  checkbox: ComponentFor<CheckboxSlotProps>
  radio: ComponentFor<RadioSlotProps>
  checkboxWrapper: ComponentFor<WrapperSlotProps>
  radioWrapper: ComponentFor<WrapperSlotProps>
  radioGroup: ComponentFor<RadioGroupSlotProps>
  fieldErrors: ComponentFor<ErrorContainerSlotProps>
  error: ComponentFor<ErrorSlotProps>
  fields: ComponentFor<FieldsSlotProps>
  globalErrors: ComponentFor<ErrorContainerSlotProps>
  button: ComponentFor<ButtonSlotProps>
}

const DefaultForm = ReactRouterForm

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
  form: typeof DefaultForm
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
  form: DefaultForm,
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

type NoOverrides = Record<never, never>

type MergeComponents<
  Base extends Partial<ComponentMap>,
  Override extends Partial<ComponentMap>,
> = {
  [K in keyof DefaultComponents]: K extends keyof Override
    ? Override[K] extends undefined
      ? ResolveComponents<Base>[K]
      : NonNullable<Override[K]>
    : ResolveComponents<Base>[K]
}

type PropsOf<T> = T extends React.ComponentType<infer P>
  ? P
  : T extends keyof JSX.IntrinsicElements
    ? JSX.IntrinsicElements[T]
    : Record<string, unknown>

export type {
  ComponentMap,
  DefaultComponents,
  NoOverrides,
  ResolveComponents,
  MergeComponents,
  PropsOf,
  ReactRouterFormProps,
}

export {
  DefaultForm,
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
