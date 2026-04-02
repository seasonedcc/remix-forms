import { applySchema } from 'composable-functions'
import hljs from 'highlight.js/lib/common'
import { formAction } from 'remix-forms'
import { z } from 'zod'
import { metaTags } from '~/helpers'
import Example from '~/ui/example'
import { SchemaForm } from '~/ui/schema-form'
import type { Route } from './+types/object-title-customization'

const title = 'Object title customization'
const description =
  'In this example, we use renderObjectField to wrap object fields in a styled container.'

export const meta: Route.MetaFunction = () => metaTags({ title, description })

const code = `const schema = z.object({
  name: z.string().min(1),
  address: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    zip: z.string().min(1),
  }),
})

export default () => (
  <SchemaForm
    schema={schema}
    renderObjectField={({ Field, ...props }) => (
      <div
        key={props.name}
        className="rounded-lg border border-primary/30 p-4"
      >
        <Field {...props} />
      </div>
    )}
  />
)`

const schema = z.object({
  name: z.string().min(1),
  address: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    zip: z.string().min(1),
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
      <SchemaForm
        schema={schema}
        renderObjectField={({ Field, ...props }) => (
          <div
            key={props.name}
            className="rounded-lg border border-primary/30 p-4"
          >
            <Field {...props} />
          </div>
        )}
      />
    </Example>
  )
}
