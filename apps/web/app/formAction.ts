import { createFormAction } from 'remix-forms'
import { redirect, data } from 'react-router'

const formAction = createFormAction({ redirect, data })

export { formAction }
