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

type FileInputSlotProps = {
  id?: string
  type?: string
  name?: string
  accept?: string
  autoFocus?: boolean
}

type RadioSlotProps = {
  id?: string
  type?: string
  name?: string
  value?: string | number
  defaultChecked?: boolean
  autoFocus?: boolean
}

type CheckboxLabelSlotProps = {
  id?: string
  children?: React.ReactNode
}

type RadioLabelSlotProps = {
  id?: string
  children?: React.ReactNode
}

type RadioGroupSlotProps = { children?: React.ReactNode }

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

type ScalarArrayFieldSlotProps = { children?: React.ReactNode }

type ScalarArrayItemSlotProps = { children?: React.ReactNode }
type ObjectArrayItemSlotProps = { children?: React.ReactNode }
type ArrayArrayItemSlotProps = { children?: React.ReactNode }

type AddButtonSlotProps = {
  onClick?: React.MouseEventHandler
  children?: React.ReactNode
}

type RemoveButtonSlotProps = {
  onClick?: React.MouseEventHandler
  children?: React.ReactNode
}

type ArrayEmptySlotProps = { children?: React.ReactNode }

type ObjectFieldsSlotProps = { children?: React.ReactNode }

type TitleSlotProps = {
  id?: string
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
  fileInput: ComponentFor<FileInputSlotProps>
  radio: ComponentFor<RadioSlotProps>
  checkboxLabel: ComponentFor<CheckboxLabelSlotProps>
  radioGroup: ComponentFor<RadioGroupSlotProps>
  radioLabel: ComponentFor<RadioLabelSlotProps>
  fieldErrors: ComponentFor<ErrorContainerSlotProps>
  error: ComponentFor<ErrorSlotProps>
  fields: ComponentFor<FieldsSlotProps>
  globalErrors: ComponentFor<ErrorContainerSlotProps>
  button: ComponentFor<ButtonSlotProps>
  scalarArrayField: ComponentFor<ScalarArrayFieldSlotProps>
  scalarArrayItem: ComponentFor<ScalarArrayItemSlotProps>
  objectArrayItem: ComponentFor<ObjectArrayItemSlotProps>
  arrayArrayItem: ComponentFor<ArrayArrayItemSlotProps>
  addButton: ComponentFor<AddButtonSlotProps>
  removeButton: ComponentFor<RemoveButtonSlotProps>
  arrayEmpty: ComponentFor<ArrayEmptySlotProps>
  objectFields: ComponentFor<ObjectFieldsSlotProps>
  arrayTitle: ComponentFor<TitleSlotProps>
  objectTitle: ComponentFor<TitleSlotProps>
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

const DefaultFileInput = React.forwardRef<
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

const DefaultRadioLabel = React.forwardRef<
  HTMLLabelElement,
  JSX.IntrinsicElements['label']
  // biome-ignore lint/a11y/noLabelWithoutControl: wrapper component, input is nested at render time
>((props, ref) => <label {...props} ref={ref} />)

const DefaultCheckboxLabel = React.forwardRef<
  HTMLLabelElement,
  JSX.IntrinsicElements['label']
  // biome-ignore lint/a11y/noLabelWithoutControl: wrapper component, input is nested at render time
>((props, ref) => <label {...props} ref={ref} />)

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

const DefaultScalarArrayField = React.forwardRef<
  HTMLDivElement,
  JSX.IntrinsicElements['div']
>((props, ref) => <div {...props} ref={ref} />)

const DefaultScalarArrayItem = React.forwardRef<
  HTMLDivElement,
  JSX.IntrinsicElements['div']
>((props, ref) => <div {...props} ref={ref} />)

const DefaultObjectArrayItem = React.forwardRef<
  HTMLDivElement,
  JSX.IntrinsicElements['div']
>((props, ref) => <div {...props} ref={ref} />)

const DefaultArrayArrayItem = React.forwardRef<
  HTMLDivElement,
  JSX.IntrinsicElements['div']
>((props, ref) => <div {...props} ref={ref} />)

const DefaultAddButton = React.forwardRef<
  HTMLButtonElement,
  JSX.IntrinsicElements['button']
>((props, ref) => <button type="button" {...props} ref={ref} />)

const DefaultRemoveButton = React.forwardRef<
  HTMLButtonElement,
  JSX.IntrinsicElements['button']
>((props, ref) => <button type="button" {...props} ref={ref} />)

const DefaultArrayEmpty = React.forwardRef<
  HTMLDivElement,
  JSX.IntrinsicElements['div']
>((props, ref) => <div {...props} ref={ref} />)

const DefaultObjectFields = React.forwardRef<
  HTMLDivElement,
  JSX.IntrinsicElements['div']
>((props, ref) => <div {...props} ref={ref} />)

const DefaultArrayTitle = React.forwardRef<
  HTMLDivElement,
  JSX.IntrinsicElements['div']
>((props, ref) => <div {...props} ref={ref} />)

const DefaultObjectTitle = React.forwardRef<
  HTMLDivElement,
  JSX.IntrinsicElements['div']
>((props, ref) => <div {...props} ref={ref} />)

type DefaultComponents = {
  form: typeof DefaultForm
  field: typeof DefaultField
  label: typeof DefaultLabel
  input: typeof DefaultInput
  multiline: typeof DefaultMultiline
  select: typeof DefaultSelect
  checkbox: typeof DefaultCheckbox
  fileInput: typeof DefaultFileInput
  radio: typeof DefaultRadio
  checkboxLabel: typeof DefaultCheckboxLabel
  radioGroup: typeof DefaultRadioGroup
  radioLabel: typeof DefaultRadioLabel
  fieldErrors: typeof DefaultFieldErrors
  error: typeof DefaultFieldError
  fields: typeof DefaultFieldsWrapper
  globalErrors: typeof DefaultGlobalErrors
  button: typeof DefaultButton
  scalarArrayField: typeof DefaultScalarArrayField
  scalarArrayItem: typeof DefaultScalarArrayItem
  objectArrayItem: typeof DefaultObjectArrayItem
  arrayArrayItem: typeof DefaultArrayArrayItem
  addButton: typeof DefaultAddButton
  removeButton: typeof DefaultRemoveButton
  arrayEmpty: typeof DefaultArrayEmpty
  objectFields: typeof DefaultObjectFields
  arrayTitle: typeof DefaultArrayTitle
  objectTitle: typeof DefaultObjectTitle
}

const defaultComponents: DefaultComponents = {
  form: DefaultForm,
  field: DefaultField,
  label: DefaultLabel,
  input: DefaultInput,
  multiline: DefaultMultiline,
  select: DefaultSelect,
  checkbox: DefaultCheckbox,
  fileInput: DefaultFileInput,
  radio: DefaultRadio,
  checkboxLabel: DefaultCheckboxLabel,
  radioGroup: DefaultRadioGroup,
  radioLabel: DefaultRadioLabel,
  fieldErrors: DefaultFieldErrors,
  error: DefaultFieldError,
  fields: DefaultFieldsWrapper,
  globalErrors: DefaultGlobalErrors,
  button: DefaultButton,
  scalarArrayField: DefaultScalarArrayField,
  scalarArrayItem: DefaultScalarArrayItem,
  objectArrayItem: DefaultObjectArrayItem,
  arrayArrayItem: DefaultArrayArrayItem,
  addButton: DefaultAddButton,
  removeButton: DefaultRemoveButton,
  arrayEmpty: DefaultArrayEmpty,
  objectFields: DefaultObjectFields,
  arrayTitle: DefaultArrayTitle,
  objectTitle: DefaultObjectTitle,
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
  DefaultFileInput,
  DefaultRadio,
  DefaultRadioGroup,
  DefaultRadioLabel,
  DefaultCheckboxLabel,
  DefaultFieldErrors,
  DefaultFieldError,
  DefaultFieldsWrapper,
  DefaultGlobalErrors,
  DefaultButton,
  DefaultScalarArrayField,
  DefaultScalarArrayItem,
  DefaultObjectArrayItem,
  DefaultArrayArrayItem,
  DefaultAddButton,
  DefaultRemoveButton,
  DefaultArrayEmpty,
  DefaultObjectFields,
  DefaultArrayTitle,
  DefaultObjectTitle,
  defaultComponents,
}
