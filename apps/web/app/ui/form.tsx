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
import CheckboxWrapper from './checkbox-wrapper'
import TextArea from './text-area'
import { useActionData, useSubmit, useTransition } from '@remix-run/react'

const RemixForm = createForm({
  useNavigation: useTransition,
  useSubmit,
  useActionData,
})

export default function Form<Schema extends FormSchema>(
  props: FormProps<Schema>,
) {
  return (
    <RemixForm<Schema>
      className="flex flex-col space-y-6"
      fieldComponent={Field}
      labelComponent={Label}
      inputComponent={Input}
      multilineComponent={TextArea}
      selectComponent={Select}
      checkboxComponent={Checkbox}
      checkboxWrapperComponent={CheckboxWrapper}
      buttonComponent={SubmitButton}
      globalErrorsComponent={Errors}
      errorComponent={Error}
      {...props}
    />
  )
}
