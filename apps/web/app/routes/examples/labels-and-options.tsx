import hljs from 'highlight.js/lib/common'
import { z } from 'zod'
import Form from '~/ui/form'
import { metaTags } from '~/helpers'
import { applySchema } from 'composable-functions'
import Example from '~/ui/example'
import { formAction } from 'remix-forms'
import { Route } from './+types/labels-and-options'

const title = 'Labels and options'
const description =
  'In this example, we add custom labels, placeholders, options, and multiline to some of our fields. The rest is inferred from the schema.'

export const meta: Route.MetaFunction = () => metaTags({ title, description })

const code = `const schema = z.object({
  name: z.string().min(1),
  roleId: z.number().int(),
  bio: z.string().min(1),
})

export default () => (
  <Form
    schema={schema}
    autoFocus="name"
    labels={{ roleId: 'Role' }}
    placeholders={{ name: 'Your name', bio: 'Your story' }}
    options={{
      roleId: [
        { name: 'Designer', value: 1 },
        { name: 'Dev', value: 2 },
      ],
    }}
    multiline={['bio']}
    pendingButtonLabel="..."
  />
)`

const schema = z.object({
  name: z.string().min(1),
  roleId: z.number().int(),
  bio: z.string().min(1),
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
      <Form
        schema={schema}
        autoFocus="name"
        labels={{ roleId: 'Role' }}
        placeholders={{ name: 'Your name', bio: 'Your story' }}
        options={{
          roleId: [
            { name: 'Designer', value: 1 },
            { name: 'Dev', value: 2 },
          ],
        }}
        multiline={['bio']}
        pendingButtonLabel="..."
      />
    </Example>
  )
}
