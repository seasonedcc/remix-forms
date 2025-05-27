import { applySchema } from 'composable-functions'
import hljs from 'highlight.js/lib/common'
import { formAction } from 'remix-forms'
import { z } from 'zod/v4'
import { metaTags } from '~/helpers'
import Example from '~/ui/example'
import { SchemaForm } from '~/ui/schema-form'
import type { Route } from './+types/radio-buttons'

const title = 'Radio buttons'
const description =
  'In this example, we render enum options in a radio button group.'

export const meta: Route.MetaFunction = () => metaTags({ title, description })

const code = `const schema = z.object({
  role: z.enum(['Designer', 'Dev']),
  department: z.enum(['HR', 'IT']).default('IT'),
})

export default () => (
  <SchemaForm schema={schema} radio={['role', 'department']} />
)`

const schema = z.object({
  role: z.enum(['Designer', 'Dev']),
  department: z.enum(['HR', 'IT']).default('IT'),
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
      <SchemaForm schema={schema} radio={['role', 'department']} />
    </Example>
  )
}
