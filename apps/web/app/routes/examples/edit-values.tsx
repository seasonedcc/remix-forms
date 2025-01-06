import hljs from 'highlight.js/lib/common'
import { z } from 'zod'
import Form from '~/ui/form'
import { metaTags } from '~/helpers'
import { applySchema } from 'composable-functions'
import Example from '~/ui/example'
import { formAction } from 'remix-forms'
import { Route } from './+types/edit-values'

const title = 'Edit values'
const description = "In this example, we'll edit existing values."

export const meta: Route.MetaFunction = () => metaTags({ title, description })

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
