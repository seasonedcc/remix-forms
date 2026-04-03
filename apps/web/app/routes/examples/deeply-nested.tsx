import { applySchema } from 'composable-functions'
import hljs from 'highlight.js/lib/common'
import { formAction } from 'remix-forms'
import { z } from 'zod'
import { metaTags } from '~/helpers'
import Example from '~/ui/example'
import { SchemaForm } from '~/ui/schema-form'
import type { Route } from './+types/deeply-nested'

const title = 'Deeply nested'
const description =
  'In this example, objects nested inside objects are auto-generated recursively.'

export const meta: Route.MetaFunction = () => metaTags({ title, description })

const code = `const schema = z.object({
  company: z.string().min(1),
  headquarters: z.object({
    address: z.object({
      street: z.string().min(1),
      city: z.string().min(1),
    }),
    phone: z.string().min(1),
  }),
})

const mutation = applySchema(schema)(async (values) => values)

export const action = async ({ request }: Route.ActionArgs) =>
  formAction({ request, schema, mutation })

export default () => (
  <SchemaForm schema={schema} />
)`

const schema = z.object({
  company: z.string().min(1),
  headquarters: z.object({
    address: z.object({
      street: z.string().min(1),
      city: z.string().min(1),
    }),
    phone: z.string().min(1),
  }),
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
      <SchemaForm schema={schema} />
    </Example>
  )
}
