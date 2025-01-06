import hljs from 'highlight.js/lib/common'
import type { ActionFunction, LoaderFunction, MetaFunction } from 'react-router'
import { z } from 'zod'
import Form from '~/ui/form'
import { metaTags } from '~/helpers'
import { makeDomainFunction } from 'domain-functions'
import Example from '~/ui/example'
import { formAction } from 'remix-forms'

const title = 'Edit values'
const description = "In this example, we'll edit existing values."

export const meta: MetaFunction = () => metaTags({ title, description })

const code = `const schema = z.object({
  firstName: z.string().min(1),
  email: z.string().min(1).email(),
  companySize: z.number(),
  howYouFoundOutAboutUs: z.enum(['fromAFriend', 'google']),
  subscribeToNewsletter: z.boolean().default(true),
})

export default () => (
  <Form
    schema={schema}
    values={{
      firstName: 'Mary',
      email: 'mary@company.com',
      companySize: 0,
      howYouFoundOutAboutUs: 'google',
      subscribeToNewsletter: false,
    }}
  />
)`

const schema = z.object({
  firstName: z.string().min(1),
  email: z.string().min(1).email(),
  companySize: z.number(),
  howYouFoundOutAboutUs: z.enum(['fromAFriend', 'google']),
  subscribeToNewsletter: z.boolean().default(true),
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
        values={{
          firstName: 'Mary',
          email: 'mary@company.com',
          companySize: 0,
          howYouFoundOutAboutUs: 'google',
          subscribeToNewsletter: false,
        }}
      />
    </Example>
  )
}
