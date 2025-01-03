import hljs from 'highlight.js/lib/common'
import type { ActionFunction, LoaderFunction, MetaFunction } from 'react-router';
import { formAction } from '~/formAction'
import { z } from 'zod'
import Form from '~/ui/form'
import { metaTags } from '~/helpers'
import { makeDomainFunction } from 'domain-functions'
import Example from '~/ui/example'

const title = 'Hidden fields with errors'
const description =
  'In this example, we ensure that errors in hidden fields are rendered as global form errors.'

export const meta: MetaFunction = () => metaTags({ title, description })

const schema = z.object({
  csrfToken: z.string().min(1),
  firstName: z.string().min(1),
})

export const loader: LoaderFunction = () => ({
  code: hljs.highlight('', { language: 'ts' }).value,
})

const mutation = makeDomainFunction(schema)(async (values) => values)

export const action: ActionFunction = async ({ request }) =>
  formAction({ request, schema, mutation })

export default function Component() {
  return (
    <Example title={title} description={description}>
      <Form
        schema={schema}
        errors={{ _global: ['Some prop error'] }}
        hiddenFields={['csrfToken']}
      />
    </Example>
  )
}
