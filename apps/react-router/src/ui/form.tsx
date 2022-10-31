// import type { FormProps, FormSchema } from 'remix-forms'
import { createForm } from 'remix-forms'
import {
  Form as RouterForm,
  useActionData,
  useSubmit,
  useNavigation,
} from 'react-router-dom'

const BaseForm = createForm({
  component: RouterForm,
  useNavigation,
  useSubmit,
  useActionData,
})

export { BaseForm as Form }

// function Form<Schema extends FormSchema>(
//   props: FormProps<Schema>,
// ) {
//   return <BaseForm {...props} />
// }
//
// export { Form }
