import { createFormAction } from 'remix-forms'
import { redirect, json } from 'react-router-dom'

const formAction = createFormAction({ redirect, json })

export { formAction }
