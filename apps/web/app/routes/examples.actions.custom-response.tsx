import hljs from 'highlight.js/lib/common'
import type { ActionFunction, LoaderFunction, MetaFunction } from 'react-router'
import { data } from 'react-router'
import { performMutation } from 'remix-forms'
import { z } from 'zod'
import Form from '~/ui/form'
import { metaTags } from '~/helpers'
import { applySchema } from 'composable-functions'
import Example from '~/ui/example'

const title = 'Custom response'
const description =
  'In this example, a successful submission will render a custom JSON.'

export const meta: MetaFunction = () => metaTags({ title, description })

const code = `import { performMutation } from 'remix-forms'

const schema = z.object({
  firstName: z.string().min(1),
  email: z.string().min(1).email(),
})

const mutation = applySchema(schema)(async (values) => values)

export const action: ActionFunction = async ({ request }) => {
  const result = await performMutation({ request, schema, mutation })

  if (!result.success) return data(result, 400)

  return { customName: result.data.firstName }
}

export default () => <Form schema={schema} />`

const schema = z.object({
  firstName: z.string().min(1),
  email: z.string().min(1).email(),
})

export const loader: LoaderFunction = () => ({
  code: hljs.highlight(code, { language: 'ts' }).value,
})

const mutation = applySchema(schema)(async (values) => values)

export const action: ActionFunction = async ({ request }) => {
  const result = await performMutation({ request, schema, mutation })

  if (!result.success) return data(result, 400)

  return { customName: result.data.firstName }
}

export default function Component() {
  return (
    <Example title={title} description={description}>
      <Form schema={schema} />
    </Example>
  )
}
