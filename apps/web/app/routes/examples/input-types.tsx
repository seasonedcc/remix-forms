import hljs from 'highlight.js/lib/common'
import { z } from 'zod'
import { SchemaForm } from '~/ui/schema-form'
import { metaTags } from '~/helpers'
import { applySchema } from 'composable-functions'
import Example from '~/ui/example'
import { formAction } from 'remix-forms'
import { Route } from './+types/input-types'

const title = 'Input types'
const description =
  "In this example, we'll edit the input type of multiple fields without having to pass children to Form."

export const meta: Route.MetaFunction = () => metaTags({ title, description })

const code = `const schema = z.object({
  email: z.string().min(1).email(),
  password: z.string().min(8),
  favColor: z.string(),
})

export default () => (
  <SchemaForm
    schema={schema}
    inputTypes={{
      email: 'email',
      password: 'password',
      favColor: 'color',
    }}
  />
)`

const schema = z.object({
  email: z.string().min(1).email(),
  password: z.string().min(8),
  favColor: z.string(),
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
        labels={{
          favColor: 'Favorite Color',
        }}
        inputTypes={{
          email: 'email',
          password: 'password',
          favColor: 'color',
        }}
      />
    </Example>
  )
}
