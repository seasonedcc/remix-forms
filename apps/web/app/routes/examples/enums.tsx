import { applySchema } from 'composable-functions'
import hljs from 'highlight.js/lib/common'
import { formAction } from 'remix-forms'
import { z } from 'zod'
import { metaTags } from '~/helpers'
import Example from '~/ui/example'
import { SchemaForm } from '~/ui/schema-form'
import type { Route } from './+types/enums'

const title = 'Enums'
const description =
  'In this example, all sorts of Zod Enum schemas are generated and validated on the client and on the server.'

export const meta: Route.MetaFunction = () => metaTags({ title, description })

const code = `const schema = z.object({
  mandatory: z.enum(['one', 'two', 'three']),
  optional: z.enum(['one', 'two', 'three']).optional(),
  nullable: z.enum(['one', 'two', 'three']).nullable(),
  default: z.enum(['one', 'two', 'three']).default('two'),
})

const mutation = applySchema(schema)(async (values) => values)

export const action = async ({ request }: Route.ActionArgs) =>
  formAction({ request, schema, mutation })

export default () => <SchemaForm schema={schema} />`

const schema = z.object({
  mandatory: z.enum(['one', 'two', 'three']),
  optional: z.enum(['one', 'two', 'three']).optional(),
  nullable: z.enum(['one', 'two', 'three']).nullable(),
  default: z.enum(['one', 'two', 'three']).default('two'),
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
