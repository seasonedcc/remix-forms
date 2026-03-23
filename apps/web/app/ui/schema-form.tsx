import {
  SchemaForm as BaseForm,
  type FormSchema,
  type SchemaFormProps,
} from 'remix-forms'
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

function SchemaForm<Schema extends FormSchema>(props: SchemaFormProps<Schema>) {
  return (
    <BaseForm
      className="flex flex-col gap-6"
      {...props}
      components={{
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
        ...props.components,
      }}
    />
  )
}

export { SchemaForm }
