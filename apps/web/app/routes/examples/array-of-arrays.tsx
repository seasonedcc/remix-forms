import { applySchema } from 'composable-functions'
import hljs from 'highlight.js/lib/common'
import { formAction } from 'remix-forms'
import { z } from 'zod'
import { metaTags } from '~/helpers'
import Example from '~/ui/example'
import { SchemaForm } from '~/ui/schema-form'
import type { Route } from './+types/array-of-arrays'

const title = 'Array of arrays'
const description =
  'In this example, nested arrays are auto-generated recursively with add/remove controls at each level.'

export const meta: Route.MetaFunction = () => metaTags({ title, description })

const code = `const schema = z.object({
  title: z.string().min(1),
  matrix: z.array(z.array(z.string().min(1)).min(1)).min(1),
})

const mutation = applySchema(schema)(async (values) => values)

export const action = async ({ request }: Route.ActionArgs) =>
  formAction({ request, schema, mutation })

export default () => (
  <SchemaForm schema={schema} />
)`

const schema = z.object({
  title: z.string().min(1),
  matrix: z.array(z.array(z.string().min(1)).min(1)).min(1),
})

export const loader = () => ({
  code: hljs.highlight(code, { language: 'ts' }).value,
})

const mutation = applySchema(schema)(async (values) => values)

export const action = async ({ request }: Route.ActionArgs) =>
  formAction({ request, schema, mutation })

export default () => (
  <Example title={title} description={description}>
    <SchemaForm schema={schema} />
  </Example>
)
