import hljs from 'highlight.js/lib/common'
import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from '@remix-run/node'
import { formAction } from '~/formAction'
import { z } from 'zod'
import Form from '~/ui/form'
import { metaTags } from '~/helpers'
import { makeDomainFunction } from 'domain-functions'
import Example from '~/ui/example'

const title = 'Global error'
const description =
  'In this example, we return a global error if the password is incorrect.'

export const meta: MetaFunction = () => metaTags({ title, description })

const code = `const schema = z.object({
  email: z.string().min(1).email(),
  password: z.string().min(1),
})

const mutation = makeDomainFunction(schema)(async (values) => {
  if (values.password !== 'supersafe') {
    throw 'Wrong email or password'
  }

  return values
})

export const action: ActionFunction = async ({ request }) =>
  formAction({ request, schema, mutation })

export default () => (
  <Form schema={schema}>
    {({ Field, Errors, Button }) => (
      <>
        <Field name="email" autoFocus />
        <Field name="password" type="password" />
        <Errors />
        <Button />
      </>
    )}
  </Form>
)`

const schema = z.object({
  email: z.string().min(1).email(),
  password: z.string().min(1),
})

export const loader: LoaderFunction = () => ({
  code: hljs.highlight(code, { language: 'ts' }).value,
})

const mutation = makeDomainFunction(schema)(async (values) => {
  if (values.password !== 'supersafe') {
    throw 'Wrong email or password'
  }

  return values
})

export const action: ActionFunction = async ({ request }) =>
  formAction({ request, schema, mutation })

export default function Component() {
  return (
    <Example title={title} description={description}>
      <Form schema={schema}>
        {({ Field, Errors, Button }) => (
          <>
            <Field name="email" autoFocus />
            <Field name="password" type="password" />
            <Errors />
            <Button />
          </>
        )}
      </Form>
    </Example>
  )
}
