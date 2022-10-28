import { createFormAction } from 'remix-forms'
import { redirect, json } from '@remix-run/node'

const formAction = createFormAction({ redirect, json })

export { formAction }
