import hljs from 'highlight.js/lib/common'
import { ActionFunction, LoaderFunction, MetaFunction } from '@remix-run/node'
import { formAction } from 'remix-forms'
import { z } from 'zod'
import Form from '~/ui/form'
import { metaTags } from '~/helpers'
import { makeDomainFunction } from 'remix-domains'
import Example from '~/ui/example'

const title = 'Strings'
const description =
  'In this example, all sorts of string schemas are validated on the client and on the server.'

export const meta: MetaFunction = () => metaTags({ title, description })

const code = `const schema = z.object({
  nonEmpty: z.string().nonempty(),
  optional: z.string().optional(),
  nullable: z.string().nullable(),
  default: z.string().default('Foo Bar'),
  minLength: z.string().min(5),
  maxLength: z.string().max(10),
  email: z.string().email(),
  url: z.string().url(),
  phoneNumber: z
    .string()
    .regex(
      /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im,
      'Invalid phone number',
    ),
})

const mutation = makeDomainFunction(schema)(async (values) => values)

export const action: ActionFunction = async ({ request }) =>
  formAction({ request, schema, mutation })

export default () => <Form schema={schema} />`

const schema = z.object({
  nonEmpty: z.string().nonempty(),
  optional: z.string().optional(),
  nullable: z.string().nullable(),
  default: z.string().default('Foo Bar'),
  minLength: z.string().min(5),
  maxLength: z.string().max(10),
  email: z.string().email(),
  url: z.string().url(),
  phoneNumber: z
    .string()
    .regex(
      /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im,
      'Invalid phone number',
    ),
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
