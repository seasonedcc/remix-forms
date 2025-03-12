import { InputError, applySchema } from 'composable-functions'
import hljs from 'highlight.js/lib/common'
import { formAction } from 'remix-forms'
import { z } from 'zod'
import { metaTags } from '~/helpers'
import Example from '~/ui/example'
import { SchemaForm } from '~/ui/schema-form'
import type { Route } from './+types/field-error'

const title = 'Field error'
const description =
  'In this example, we return a server-side field error if the email is already taken.'

export const meta: Route.MetaFunction = () => metaTags({ title, description })

const code = `import { InputError } from 'composable-functions'

const schema = z.object({
  email: z.string().min(1).email(),
  password: z.string().min(1),
})

const takenEmails = ['foo@bar.com', 'bar@foo.com']

const mutation = applySchema(schema)(async (values) => {
  if (takenEmails.includes(values.email)) {
    throw new InputError('Email already taken', ['email'])
  }

  return values
})

export const action = async ({ request }: Route.ActionArgs) =>
  formAction({ request, schema, mutation })

export default () => <SchemaForm schema={schema} />`

const schema = z.object({
  email: z.string().min(1).email(),
  password: z.string().min(1),
})

export const loader = () => ({
  code: hljs.highlight(code, { language: 'ts' }).value,
})

const takenEmails = ['foo@bar.com', 'bar@foo.com']

const mutation = applySchema(schema)(async (values) => {
  if (takenEmails.includes(values.email)) {
    throw new InputError('Email already taken', ['email'])
  }

  return values
})

export const action = async ({ request }: Route.ActionArgs) =>
  formAction({ request, schema, mutation })

export default function Component() {
  return (
    <Example title={title} description={description}>
      <SchemaForm schema={schema} />
    </Example>
  )
}
