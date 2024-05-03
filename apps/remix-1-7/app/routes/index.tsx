import { makeDomainFunction } from 'domain-functions'
import type { ActionArgs } from '@remix-run/node'
import { z } from 'zod'
import { formAction } from '../formAction'
import { Form } from '../ui/form'

const schema = z.object({
  firstName: z.string().min(1),
  email: z.string().min(1).email(),
})

const mutation = makeDomainFunction(schema)(async (values) => values)

export function action({ request }: ActionArgs) {
  return formAction({
    request,
    schema,
    mutation,
    successPath: '/success',
  })
}

export default () => <Form schema={schema} />
