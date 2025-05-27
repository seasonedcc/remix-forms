import { applySchema } from 'composable-functions'
import hljs from 'highlight.js/lib/common'
import { formAction } from 'remix-forms'
import { z } from 'zod/v4'
import { metaTags } from '~/helpers'
import Example from '~/ui/example'
import { SchemaForm } from '~/ui/schema-form'
import type { Route } from './+types/booleans'

const title = 'Booleans'
const description =
  'In this example, all sorts of boolean schemas are validated on the client and on the server.'

export const meta: Route.MetaFunction = () => metaTags({ title, description })

const code = `const schema = z.object({
  mandatory: z.boolean(),
  optional: z.boolean().optional(),
  nullable: z.boolean().nullable(),
  defaultFalse: z.boolean().default(false),
  defaultTrue: z.boolean().default(true),
})

const mutation = applySchema(schema)(async (values) => values)

export const action = async ({ request }: Route.ActionArgs) =>
  formAction({ request, schema, mutation })

export default () => <SchemaForm schema={schema} />`

const schema = z.object({
  mandatory: z.boolean(),
  optional: z.boolean().optional(),
  nullable: z.boolean().nullable(),
  defaultFalse: z.boolean().default(false),
  defaultTrue: z.boolean().default(true),
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
