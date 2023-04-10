import { json, redirect } from '@remix-run/node'
import { createFormAction } from 'remix-forms'

const formAction = createFormAction({ redirect, json })

export { formAction }
