import hljs from 'highlight.js/lib/common'
import { z } from 'zod'
import { SchemaForm } from '~/ui/schema-form'
import { metaTags } from '~/helpers'
import { applySchema } from 'composable-functions'
import Example from '~/ui/example'
import { formAction } from 'remix-forms'
import { Route } from './+types/on-change'

const title = 'onChange mode'
const description =
  'In this example, client-side validations will happen every time the value of a field changes and the submit button will only be enabled if the form is valid.'

export const meta: Route.MetaFunction = () => metaTags({ title, description })

const code = `const schema = z.object({
  firstName: z.string().min(1),
  email: z.string().min(1).email(),
})

const mutation = applySchema(schema)(async (values) => values)

export const action = async ({ request }: Route.ActionArgs) =>
  formAction({ request, schema, mutation })

export default () => <SchemaForm schema={schema} mode="onChange" />`

const schema = z.object({
  firstName: z.string().min(1),
  email: z.string().min(1).email(),
})

export const loader = () => ({
  code: hljs.highlight(code, { language: 'ts' }).value,
})

const mutation = applySchema(schema)(async (values) => values)

export const action = async ({ request }: Route.ActionArgs) =>
  formAction({ request, schema, mutation })

export default function Component() {
  return (
    <Example title={title} description={description}>
      <SchemaForm schema={schema} mode="onChange" />
    </Example>
  )
}
