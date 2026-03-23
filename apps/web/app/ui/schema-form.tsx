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

const SchemaForm = makeSchemaForm({
  fields: Fields,
  field: Field,
  label: Label,
  input: Input,
  multiline: TextArea,
  select: Select,
  radio: Radio,
  radioGroup: RadioGroup,
  radioWrapper: InputWrapper,
  checkboxWrapper: InputWrapper,
  checkbox: Checkbox,
  button: SubmitButton,
  globalErrors: Errors,
  error: Error,
})

export { SchemaForm }
