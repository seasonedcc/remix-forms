import { createForm, createFormAction } from 'remix-forms'
import { redirect, json } from '@remix-run/node'
import {
  Form as FrameworkForm,
  useActionData,
  useSubmit,
  useTransition as useNavigation,
} from '@remix-run/react'

const formAction = createFormAction({ redirect, json })

const Form = createForm({
  component: FrameworkForm,
  useNavigation,
  useSubmit,
  useActionData,
})

export { formAction, Form }
