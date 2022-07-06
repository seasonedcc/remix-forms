import hljs from 'highlight.js/lib/common'
import { ActionFunction, LoaderFunction, MetaFunction } from '@remix-run/node'
import { formAction } from 'remix-forms'
import { z } from 'zod'
import Form from '~/ui/form'
import { metaTags } from '~/helpers'
import { InputError, makeDomainFunction } from 'remix-domains'
import Example from '~/ui/example'

const title = 'Field error'
const description =
  'In this example, we return a server-side field error if the email is already taken.'

export const meta: MetaFunction = () => metaTags({ title, description })

const code = `import { InputError } from 'remix-domains'

const schema = z.object({
  email: z.string().nonempty().email(),
  password: z.string().nonempty(),
})

const takenEmails = ['foo@bar.com', 'bar@foo.com']

const mutation = makeDomainFunction(schema)(async (values) => {
  if (takenEmails.includes(values.email)) {
    throw new InputError('Email already taken', 'email')
  }

  return values
})

export const action: ActionFunction = async ({ request }) =>
  formAction({ request, schema, mutation })

export default () => <Form schema={schema} />`

const schema = z.object({
  email: z.string().nonempty().email(),
  password: z.string().nonempty(),
})

export const loader: LoaderFunction = () => ({
  code: hljs.highlight(code, { language: 'ts' }).value,
})

const takenEmails = ['foo@bar.com', 'bar@foo.com']

const mutation = makeDomainFunction(schema)(async (values) => {
  if (takenEmails.includes(values.email)) {
    throw new InputError('Email already taken', 'email')
  }

  return values
})

export const action: ActionFunction = async ({ request }) =>
  formAction({ request, schema, mutation })

export default function Component() {
  return (
    <Example title={title} description={description}>
      <Form schema={schema} />
    </Example>
  )
}
