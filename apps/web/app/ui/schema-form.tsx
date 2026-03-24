import * as React from 'react'
import { Form } from 'react-router'
import { makeSchemaForm } from 'remix-forms'
import Checkbox from './checkbox'
import Error from './error'
import Errors from './errors'
import Field from './field'
import Input from './input'
import Label from './label'
import Radio from './radio'
import Select from './select'
import SubmitButton from './submit-button'

import InputWrapper from './input-wrapper'
import RadioGroup from './radio-group'

import Fields from './fields'
import TextArea from './text-area'

const StyledForm = React.forwardRef<
  HTMLFormElement,
  React.ComponentPropsWithRef<typeof Form>
>((props, ref) => <Form ref={ref} className="flex flex-col gap-6" {...props} />)

const SchemaForm = makeSchemaForm({
  form: StyledForm,
  fields: Fields,
  field: Field,
  label: Label,
  input: Input,
  multiline: TextArea,
  select: Select,
  radio: Radio,
  radioGroup: RadioGroup,
  radioWrapper: InputWrapper,
  radioLabel: Label,
  checkboxWrapper: InputWrapper,
  checkboxLabel: Label,
  checkbox: Checkbox,
  button: SubmitButton,
  globalErrors: Errors,
  error: Error,
})

export { SchemaForm }
