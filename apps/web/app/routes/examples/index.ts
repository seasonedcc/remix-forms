import { redirect } from '@remix-run/node'
import { $path } from 'remix-routes'

export const loader = () => redirect($path('/examples/actions/redirect'))
