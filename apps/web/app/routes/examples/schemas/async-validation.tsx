import hljs from 'highlight.js/lib/common'
import { ActionFunction, LoaderFunction, MetaFunction } from '@remix-run/node'
import { formAction } from 'remix-forms'
import { z } from 'zod'
import Form from '~/ui/form'
import { metaTags } from '~/helpers'
import { makeDomainFunction } from 'remix-domains'
import Example from '~/ui/example'

const title = 'Async validation'
const description =
  'In this example, we add async validation to check for emails already taken.'

export const meta: MetaFunction = () => metaTags({ title, description })

const code = `const takenEmails = ['foo@bar.com', 'bar@foo.com']

async function validateEmail(email: string) {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return !takenEmails.includes(email)
}

const schema = z.object({
  firstName: z.string().nonempty(),
  email: z
    .string()
    .nonempty()
    .email()
    .refine(validateEmail, { message: 'E-mail already taken.' }),
})

export default () => <Form schema={schema} />`

const takenEmails = ['foo@bar.com', 'bar@foo.com']

async function validateEmail(email: string) {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return !takenEmails.includes(email)
}

const schema = z.object({
  firstName: z.string().nonempty(),
  email: z
    .string()
    .nonempty()
    .email()
    .refine(validateEmail, { message: 'E-mail already taken.' }),
})

export const loader: LoaderFunction = () => ({
  code: hljs.highlight(code, { language: 'ts' }).value,
})

const mutation = makeDomainFunction(schema)(async (values) => values)

export const action: ActionFunction = async ({ request }) =>
  formAction({ request, schema, mutation })

export default function Component() {
  return (
    <Example title={title} description={description}>
      <Form schema={schema} />
    </Example>
  )
}
