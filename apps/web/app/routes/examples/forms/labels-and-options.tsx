import hljs from 'highlight.js/lib/common'
import { ActionFunction, LoaderFunction, MetaFunction } from '@remix-run/node'
import { formAction } from 'remix-forms'
import { z } from 'zod'
import Form from '~/ui/form'
import { metaTags } from '~/helpers'
import { makeDomainFunction } from 'remix-domains'
import Example from '~/ui/example'

const title = 'Labels and options'
const description =
  'In this example, we add custom labels, placeholders, options, and multiline to some of our fields. The rest is inferred from the schema.'

export const meta: MetaFunction = () => metaTags({ title, description })

const code = `const schema = z.object({
  name: z.string().nonempty(),
  roleId: z.number().int(),
  bio: z.string().nonempty(),
})

export default () => (
  <Form
    schema={schema}
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
  name: z.string().nonempty(),
  roleId: z.number().int(),
  bio: z.string().nonempty(),
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
