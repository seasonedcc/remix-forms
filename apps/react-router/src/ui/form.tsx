import { createForm } from 'remix-forms'
import {
  Form as RouterForm,
  useActionData,
  useSubmit,
  useNavigation,
} from 'react-router-dom'

const Form = createForm({
  component: RouterForm,
  useNavigation,
  useSubmit,
  useActionData,
})

export { Form }
