import hljs from 'highlight.js/lib/common'
import { z } from 'zod'
import { SchemaForm } from '~/ui/schema-form'
import { metaTags } from '~/helpers'
import { applySchema } from 'composable-functions'
import Example from '~/ui/example'
import { formAction } from 'remix-forms'
import { Route } from './+types/strings'

const title = 'Strings'
const description =
  'In this example, all sorts of string schemas are validated on the client and on the server.'

export const meta: Route.MetaFunction = () => metaTags({ title, description })

const code = `const schema = z.object({
  nonEmpty: z.string().min(1),
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
      /^[+]?[(]?[0-9]{3}[)]?[-\\s.]?[0-9]{3}[-\\s.]?[0-9]{4,6}$/im,
      'Invalid phone number',
    ),
})

const mutation = applySchema(schema)(async (values) => values)

export const action = async ({ request }: Route.ActionArgs) =>
  formAction({ request, schema, mutation })

export default () => <SchemaForm schema={schema} />`

const schema = z.object({
  nonEmpty: z.string().min(1),
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
      /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im,
      'Invalid phone number',
    ),
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
