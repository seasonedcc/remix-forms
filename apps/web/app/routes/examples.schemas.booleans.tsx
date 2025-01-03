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

const title = 'Booleans'
const description =
  'In this example, all sorts of boolean schemas are validated on the client and on the server.'

export const meta: MetaFunction = () => metaTags({ title, description })

const code = `const schema = z.object({
  mandatory: z.boolean(),
  optional: z.boolean().optional(),
  nullable: z.boolean().nullable(),
  defaultFalse: z.boolean().default(false),
  defaultTrue: z.boolean().default(true),
})

const mutation = makeDomainFunction(schema)(async (values) => values)

export const action: ActionFunction = async ({ request }) =>
  formAction({ request, schema, mutation })

export default () => <Form schema={schema} />`

const schema = z.object({
  mandatory: z.boolean(),
  optional: z.boolean().optional(),
  nullable: z.boolean().nullable(),
  defaultFalse: z.boolean().default(false),
  defaultTrue: z.boolean().default(true),
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
