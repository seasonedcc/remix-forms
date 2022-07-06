import hljs from 'highlight.js/lib/common'
import { ActionFunction, LoaderFunction, MetaFunction } from '@remix-run/node'
import { formAction } from 'remix-forms'
import { z } from 'zod'
import Form from '~/ui/form'
import { metaTags } from '~/helpers'
import { makeDomainFunction } from 'remix-domains'
import Example from '~/ui/example'

const title = 'Numbers'
const description =
  'In this example, all sorts of number schemas are validated on the client and on the server.'

export const meta: MetaFunction = () => metaTags({ title, description })

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

const mutation = makeDomainFunction(schema)(async (values) => values)

export const action: ActionFunction = async ({ request }) =>
  formAction({ request, schema, mutation })

export default () => <Form schema={schema} />`

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

export const loader: LoaderFunction = () => ({
  code: hljs.highlight(code, { language: 'ts' }).value,
})

const mutation = makeDomainFunction(schema)(async (values) => values)

export const action: ActionFunction = async ({ request }) =>
  formAction({ request, schema, mutation })

export default function Component() {
  return (
    <Example title={title} description={description}>
      <Form schema={schema} />
    </Example>
  )
}
