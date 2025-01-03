import { redirect } from '@remix-run/node'

export const loader = () => redirect('/examples/actions/redirect')
