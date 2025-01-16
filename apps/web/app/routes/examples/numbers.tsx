import hljs from 'highlight.js/lib/common'
import { z } from 'zod'
import { SchemaForm } from '~/ui/schema-form'
import { metaTags } from '~/helpers'
import { applySchema } from 'composable-functions'
import Example from '~/ui/example'
import { formAction } from 'remix-forms'
import { Route } from './+types/numbers'

const title = 'Numbers'
const description =
  'In this example, all sorts of number schemas are validated on the client and on the server.'

export const meta: Route.MetaFunction = () => metaTags({ title, description })

const code = `const schema = z.object({
  mandatory: z.number(),
  optional: z.number().optional(),
  nullable: z.number().nullable(),
  defaultRandom: z.number().default(Math.random),
  greaterThan: z.number().gt(5),
  greaterThanOrEqualTo: z.number().gte(10),
  lowerThan: z.number().lt(5),
  lowerThanOrEqualTo: z.number().lte(10),
  integer: z.number().int(),
})

const mutation = applySchema(schema)(async (values) => values)

export const action = async ({ request }: Route.ActionArgs) =>
  formAction({ request, schema, mutation })

export default () => <SchemaForm schema={schema} />`

const schema = z.object({
  mandatory: z.number(),
  optional: z.number().optional(),
  nullable: z.number().nullable(),
  defaultRandom: z.number().default(Math.random),
  greaterThan: z.number().gt(5),
  greaterThanOrEqualTo: z.number().gte(10),
  lowerThan: z.number().lt(5),
  lowerThanOrEqualTo: z.number().lte(10),
  integer: z.number().int(),
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
