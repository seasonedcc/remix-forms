import hljs from 'highlight.js/lib/common'
import { z } from 'zod'
import { SchemaForm } from '~/ui/schema-form'
import { metaTags } from '~/helpers'
import { applySchema } from 'composable-functions'
import Example from '~/ui/example'
import { formAction } from 'remix-forms'
import { Route } from './+types/hidden-field-with-errors'

const title = 'Hidden fields with errors'
const description =
  'In this example, we ensure that errors in hidden fields are rendered as global form errors.'

export const meta: Route.MetaFunction = () => metaTags({ title, description })

const schema = z.object({
  csrfToken: z.string().min(1),
  firstName: z.string().min(1),
})

export const loader = () => ({
  code: hljs.highlight('', { language: 'ts' }).value,
})

const mutation = applySchema(schema)(async (values) => values)

export const action = async ({ request }: Route.ActionArgs) =>
  formAction({ request, schema, mutation })

export default function Component() {
  return (
    <Example title={title} description={description}>
      <SchemaForm
        schema={schema}
        errors={{ _global: ['Some prop error'] }}
        hiddenFields={['csrfToken']}
      />
    </Example>
  )
}
