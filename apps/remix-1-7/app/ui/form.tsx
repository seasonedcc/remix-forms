import { createForm } from 'remix-forms'
import {
  Form as RemixForm,
  useActionData,
  useSubmit,
  useTransition as useNavigation,
} from '@remix-run/react'

const Form = createForm({
  component: RemixForm,
  useNavigation,
  useSubmit,
  useActionData,
})

export { Form }
