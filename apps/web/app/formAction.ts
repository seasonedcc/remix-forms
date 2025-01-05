import { createFormAction } from 'remix-forms'
import { redirect } from 'react-router'

// @ts-ignore
const formAction = createFormAction({ redirect })

export { formAction }
