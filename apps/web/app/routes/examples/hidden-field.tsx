import { applySchema } from 'composable-functions'
import hljs from 'highlight.js/lib/common'
import { formAction } from 'remix-forms'
import { z } from 'zod/v4'
import { metaTags } from '~/helpers'
import Example from '~/ui/example'
import { SchemaForm } from '~/ui/schema-form'
import type { Route } from './+types/hidden-field'

const title = 'Hidden field'
const description = 'In this example, we add a hidden field to our form.'

export const meta: Route.MetaFunction = () => metaTags({ title, description })

const code = `const schema = z.object({
  csrfToken: z.string().min(1),
  firstName: z.string().min(1),
  email: z.string().min(1).email(),
  howDidYouFindUs: z.enum(['aFriend', 'google']),
})

export default () => (
    <SchemaForm
      schema={schema}
      hiddenFields={['csrfToken']}
      values={{ csrfToken: 'abc123' }}
    />
)`

const schema = z.object({
  csrfToken: z.string().min(1),
  firstName: z.string().min(1),
  email: z.string().min(1).email(),
  howDidYouFindUs: z.enum(['aFriend', 'google']),
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
        hiddenFields={['csrfToken']}
        values={{ csrfToken: 'abc123' }}
      />
    </Example>
  )
}
