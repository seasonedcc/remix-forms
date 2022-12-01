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

const title = 'Radio buttons'
const description =
  'In this example, we render enum options in a radio button group.'

export const meta: MetaFunction = () => metaTags({ title, description })

const code = `const schema = z.object({
  name: z.string().min(1),
  role: z.enum(['Designer', 'Dev']),
})

export default () => (
  <Form schema={schema} radio={['role']} />
)`

const schema = z.object({
  name: z.string().min(1),
  role: z.enum(['Designer', 'Dev']),
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
      <Form schema={schema} radio={['role']} />
    </Example>
  )
}
