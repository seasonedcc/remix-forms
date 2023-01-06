import { createForm, createFormAction } from 'remix-forms'
import {
  Form as FrameworkForm,
  useActionData,
  useSubmit,
  useNavigation,
  redirect,
  json,
} from 'react-router-dom'

const formAction = createFormAction({ redirect, json })

const Form = createForm({
  component: FrameworkForm,
  useNavigation,
  useSubmit,
  useActionData,
})

export { formAction, Form }
