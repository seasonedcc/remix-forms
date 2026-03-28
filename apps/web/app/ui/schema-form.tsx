import * as React from 'react'
import { Form } from 'react-router'
import { makeSchemaForm } from 'remix-forms'
import Checkbox from './checkbox'
import CheckboxLabel from './checkbox-label'
import Error from './error'
import Errors from './errors'
import Field from './field'
import Fields from './fields'
import FileInput from './file-input'
import Input from './input'
import Label from './label'
import Radio from './radio'
import RadioGroup from './radio-group'
import RadioLabel from './radio-label'
import Select from './select'
import SubmitButton from './submit-button'
import TextArea from './text-area'

const StyledForm = React.forwardRef<
  HTMLFormElement,
  React.ComponentPropsWithRef<typeof Form>
>((props, ref) => <Form ref={ref} className="flex flex-col gap-6" {...props} />)

const ArrayField = React.forwardRef<
  HTMLDivElement,
  JSX.IntrinsicElements['div']
>((props, ref) => (
  <div ref={ref} className="flex flex-1 flex-col gap-2" {...props} />
))

const ArrayItem = React.forwardRef<
  HTMLDivElement,
  JSX.IntrinsicElements['div']
>((props, ref) => (
  <div ref={ref} className="flex items-center gap-2" {...props} />
))

const AddButton = React.forwardRef<
  HTMLButtonElement,
  JSX.IntrinsicElements['button']
>((props, ref) => (
  <button
    ref={ref}
    type="button"
    className="btn btn-outline btn-sm mt-2 self-start"
    {...props}
  />
))

const RemoveButton = React.forwardRef<
  HTMLButtonElement,
  JSX.IntrinsicElements['button']
>((props, ref) => (
  <button
    ref={ref}
    type="button"
    className="btn btn-ghost btn-sm text-error"
    {...props}
  />
))

const ArrayEmpty = React.forwardRef<
  HTMLDivElement,
  JSX.IntrinsicElements['div']
>((props, ref) => (
  <div ref={ref} className="py-2 text-base-content/50 text-sm" {...props} />
))

const ObjectField = React.forwardRef<
  HTMLDivElement,
  JSX.IntrinsicElements['div']
>((props, ref) => (
  <div
    ref={ref}
    className="flex flex-col gap-4 border-base-100 border-l-2 pl-4"
    {...props}
  />
))

const SchemaForm = makeSchemaForm({
  form: StyledForm,
  fields: Fields,
  field: Field,
  label: Label,
  input: Input,
  fileInput: FileInput,
  multiline: TextArea,
  select: Select,
  radio: Radio,
  radioGroup: RadioGroup,
  radioLabel: RadioLabel,
  checkboxLabel: CheckboxLabel,
  checkbox: Checkbox,
  button: SubmitButton,
  globalErrors: Errors,
  error: Error,
  arrayField: ArrayField,
  arrayItem: ArrayItem,
  addButton: AddButton,
  removeButton: RemoveButton,
  arrayEmpty: ArrayEmpty,
  objectField: ObjectField,
})

export { SchemaForm }
