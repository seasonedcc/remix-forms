import { makeDomainFunction } from 'domain-functions'
import type { ActionFunctionArgs } from 'react-router-dom'
import { z } from 'zod'
import { Form, formAction } from '@remix-forms/react-router'

const schema = z.object({
  firstName: z.string().min(1),
  email: z.string().min(1).email(),
})

const mutation = makeDomainFunction(schema)(async (values) => values)

export function action({ request }: ActionFunctionArgs) {
  return formAction({
    request,
    schema,
    mutation,
    successPath: '/success',
  })
}

export default () => <Form schema={schema} />
