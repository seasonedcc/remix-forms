import { applySchema } from 'composable-functions'
import hljs from 'highlight.js/lib/common'
import { formAction } from 'remix-forms'
import { z } from 'zod'
import { metaTags } from '~/helpers'
import Example from '~/ui/example'
import { SchemaForm } from '~/ui/schema-form'
import type { Route } from './+types/array-title-customization'

const title = 'Array title customization'
const description =
  'In this example, we use renderArrayField to wrap array fields in a styled container with a badge showing the item type.'

export const meta: Route.MetaFunction = () => metaTags({ title, description })

const code = `const schema = z.object({
  title: z.string().min(1),
  tags: z.array(z.string().min(1)),
})

export default () => (
  <SchemaForm
    schema={schema}
    renderArrayField={({ Field, ...props }) => (
      <div key={props.name} className="rounded-lg border border-accent/30 p-4">
        <p className="mb-2 text-xs font-semibold text-accent">
          Array of {props.shape.item.type}
        </p>
        <Field {...props} />
      </div>
    )}
  />
)`

const schema = z.object({
  title: z.string().min(1),
  tags: z.array(z.string().min(1)),
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
        renderArrayField={({ Field, ...props }) => (
          <div
            key={props.name}
            className="rounded-lg border border-accent/30 p-4"
          >
            <p className="mb-2 font-semibold text-accent text-xs">
              Array of {props.shape.item.type}
            </p>
            <Field {...props} />
          </div>
        )}
      />
    </Example>
  )
}
