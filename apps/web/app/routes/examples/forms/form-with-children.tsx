import hljs from 'highlight.js/lib/common'
import { ActionFunction, LoaderFunction, MetaFunction } from '@remix-run/node'
import { formAction } from 'remix-forms'
import { z } from 'zod'
import Form from '~/ui/form'
import { metaTags } from '~/helpers'
import { makeDomainFunction } from 'remix-domains'
import Example from '~/ui/example'

const title = 'Form with children'
const description =
  'In this example, we pass a children function to gain control over the Form UI.'

export const meta: MetaFunction = () => metaTags({ title, description })

const code = `const schema = z.object({
  csrfToken: z.string().nonempty(),
  firstName: z.string().nonempty(),
  email: z.string().nonempty().email(),
  howYouFoundOutAboutUs: z.enum(['fromAFriend', 'google']),
  message: z.string().optional(),
})

export default () => (
  <Form schema={schema}>
    {({ Field, Errors, Button }) => (
      <>
        <Field name="csrfToken" value="abc123" hidden />
        <Field name="firstName" placeholder="Your first name" />
        <Field name="email" label="E-mail" placeholder="Your e-mail" />
        <em>You'll hear from us at this address 👆🏽</em>
        <Field
          name="howYouFoundOutAboutUs"
          options={[
            { name: 'Friend', value: 'fromAFriend' },
            { name: 'Search', value: 'google' },
          ]}
        />
        <Field name="message" multiline placeholder="Your message" />
        <Errors />
        <Button />
      </>
    )}
  </Form>
)`

const schema = z.object({
  csrfToken: z.string().nonempty(),
  firstName: z.string().nonempty(),
  email: z.string().nonempty().email(),
  howYouFoundOutAboutUs: z.enum(['fromAFriend', 'google']),
  message: z.string().optional(),
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
      <Form schema={schema}>
        {({ Field, Errors, Button }) => (
          <>
            <Field name="csrfToken" value="abc123" hidden />
            <Field name="firstName" placeholder="Your first name" />
            <Field name="email" label="E-mail" placeholder="Your e-mail" />
            <em>You'll hear from us at this address 👆🏽</em>
            <Field
              name="howYouFoundOutAboutUs"
              options={[
                { name: 'Friend', value: 'fromAFriend' },
                { name: 'Search', value: 'google' },
              ]}
            />
            <Field name="message" multiline placeholder="Your message" />
            <Errors />
            <Button />
          </>
        )}
      </Form>
    </Example>
  )
}
