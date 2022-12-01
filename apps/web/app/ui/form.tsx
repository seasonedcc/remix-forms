import type { FormProps, FormSchema } from 'remix-forms'
import { createForm } from 'remix-forms'
import Error from './error'
import Errors from './errors'
import Field from './field'
import Input from './input'
import Label from './label'
import Select from './select'
import SubmitButton from './submit-button'
import Checkbox from './checkbox'
import Radio from './radio'

import InputWrapper from './input-wrapper'
import RadioGroup from './radio-group'

import TextArea from './text-area'
import {
  Form as RemixForm,
  useActionData,
  useSubmit,
  useTransition as useNavigation,
} from '@remix-run/react'

const BaseForm = createForm({
  component: RemixForm,
  useNavigation,
  useSubmit,
  useActionData,
})

export default function Form<Schema extends FormSchema>(
  props: FormProps<Schema>,
) {
  return (
    <BaseForm
      className="flex flex-col space-y-6"
      fieldComponent={Field}
      labelComponent={Label}
      inputComponent={Input}
      multilineComponent={TextArea}
      selectComponent={Select}
      radioComponent={Radio}
      radioGroupComponent={RadioGroup}
      radioWrapperComponent={InputWrapper}
      checkboxWrapperComponent={InputWrapper}
      checkboxComponent={Checkbox}
      buttonComponent={SubmitButton}
      globalErrorsComponent={Errors}
      errorComponent={Error}
      {...props}
    />
  )
}
