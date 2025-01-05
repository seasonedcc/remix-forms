import hljs from 'highlight.js/lib/common'
import type { ActionFunction, LoaderFunction, MetaFunction } from 'react-router'
import { z } from 'zod'
import Form from '~/ui/form'
import { metaTags } from '~/helpers'
import { applySchema } from 'composable-functions'
import Example from '~/ui/example'
import { formAction } from 'remix-forms'

const title = 'Form with children'
const description =
  'In this example, we pass a children function to gain control over the Form UI.'

export const meta: MetaFunction = () => metaTags({ title, description })

const code = `const schema = z.object({
  csrfToken: z.string().min(1),
  firstName: z.string().min(1),
  email: z.string().min(1).email(),
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
          radio
        />
        <Field name="message" multiline placeholder="Your message" />
        <Errors />
        <Button />
      </>
    )}
  </Form>
)`

const schema = z.object({
  csrfToken: z.string().min(1),
  firstName: z.string().min(1),
  email: z.string().min(1).email(),
  howYouFoundOutAboutUs: z.enum(['fromAFriend', 'google']),
  message: z.string().optional(),
})

export const loader: LoaderFunction = () => ({
  code: hljs.highlight(code, { language: 'ts' }).value,
})

const mutation = applySchema(schema)(async (values) => values)

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
            <em>You&apos;ll hear from us at this address 👆🏽</em>
            <Field
              name="howYouFoundOutAboutUs"
              options={[
                { name: 'Friend', value: 'fromAFriend' },
                { name: 'Search', value: 'google' },
              ]}
              radio
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
