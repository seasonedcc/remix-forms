import { applySchema } from 'composable-functions'
import hljs from 'highlight.js/lib/common'
import { formAction } from 'remix-forms'
import { z } from 'zod'
import { metaTags } from '~/helpers'
import Example from '~/ui/example'
import { SchemaForm } from '~/ui/schema-form'
import type { Route } from './+types/global-error'

const title = 'Global error'
const description =
  'In this example, we return a global error if the password is incorrect.'

export const meta: Route.MetaFunction = () => metaTags({ title, description })

const code = `const schema = z.object({
  email: z.string().min(1).email(),
  password: z.string().min(1),
})

const mutation = applySchema(schema)(async (values) => {
  if (values.password !== 'supersafe') {
    throw new Error('Wrong email or password')
  }

  return values
})

export const action = async ({ request }: Route.ActionArgs) =>
  formAction({ request, schema, mutation })

export default () => (
  <SchemaForm schema={schema}>
    {({ Field, Errors, Button }) => (
      <>
        <Field name="email" autoFocus />
        <Field name="password" type="password" />
        <Errors />
        <Button />
      </>
    )}
  </SchemaForm>
)`

const schema = z.object({
  email: z.string().min(1).email(),
  password: z.string().min(1),
})

export const loader = () => ({
  code: hljs.highlight(code, { language: 'ts' }).value,
})

const mutation = applySchema(schema)(async (values) => {
  if (values.password !== 'supersafe') {
    throw new Error('Wrong email or password')
  }

  return values
})

export const action = async ({ request }: Route.ActionArgs) =>
  formAction({ request, schema, mutation })

export default function Component() {
  return (
    <Example title={title} description={description}>
      <SchemaForm schema={schema}>
        {({ Field, Errors, Button }) => (
          <>
            <Field name="email" autoFocus />
            <Field name="password" type="password" />
            <Errors />
            <Button />
          </>
        )}
      </SchemaForm>
    </Example>
  )
}
