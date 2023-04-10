import { createForm } from 'remix-forms'
import {
  Form as RemixForm,
  useActionData,
  useSubmit,
  useNavigation,
} from '@remix-run/react'

const Form = createForm({
  component: RemixForm,
  useNavigation,
  useSubmit,
  useActionData,
})

export { Form }
