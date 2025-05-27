import { applySchema } from 'composable-functions'
import hljs from 'highlight.js/lib/common'
import { data } from 'react-router'
import { performMutation } from 'remix-forms'
import { z } from 'zod/v4'
import { metaTags } from '~/helpers'
import Example from '~/ui/example'
import { SchemaForm } from '~/ui/schema-form'
import type { Route } from './+types/custom-response'

const title = 'Custom response'
const description =
  'In this example, a successful submission will render a custom JSON.'

export const meta: Route.MetaFunction = () => metaTags({ title, description })

const code = `import { performMutation } from 'remix-forms'

const schema = z.object({
  firstName: z.string().min(1),
  email: z.string().min(1).email(),
})

const mutation = applySchema(schema)(async (values) => values)

export const action = async ({ request }: Route.ActionArgs) => {
  const result = await performMutation({ request, schema, mutation })

  if (!result.success) return data(result, 400)

  return { customName: result.data.firstName }
}

export default () => <SchemaForm schema={schema} />`

const schema = z.object({
  firstName: z.string().min(1),
  email: z.string().min(1).email(),
})

export const loader = () => ({
  code: hljs.highlight(code, { language: 'ts' }).value,
})

const mutation = applySchema(schema)(async (values) => values)

export const action = async ({ request }: Route.ActionArgs) => {
  const result = await performMutation({ request, schema, mutation })

  if (!result.success) return data(result, 400)

  return { customName: result.data.firstName }
}

export default function Component() {
  return (
    <Example title={title} description={description}>
      <SchemaForm schema={schema} />
    </Example>
  )
}
