import hljs from 'highlight.js/lib/common'
import type { ActionFunction, LoaderFunction, MetaFunction } from 'react-router'
import { formAction } from '~/formAction'
import { z } from 'zod'
import Form from '~/ui/form'
import { metaTags } from '~/helpers'
import { makeDomainFunction } from 'domain-functions'
import Example from '~/ui/example'

const title = 'Input types'
const description =
  "In this example, we'll edit the input type of multiple fields without having to pass children to Form."

export const meta: MetaFunction = () => metaTags({ title, description })

const code = `const schema = z.object({
  email: z.string().min(1).email(),
  password: z.string().min(8),
  favColor: z.string(),
})

export default () => (
  <Form
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

export const loader: LoaderFunction = () => ({
  code: hljs.highlight(code, { language: 'ts' }).value,
})

const mutation = makeDomainFunction(schema)(async (values) => values)

export const action: ActionFunction = async ({ request }) =>
  formAction({ request, schema, mutation })

export default function Component() {
  return (
    <Example title={title} description={description}>
      <Form
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
