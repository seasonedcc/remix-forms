import { applySchema } from 'composable-functions'
import hljs from 'highlight.js/lib/common'
import { formAction } from 'remix-forms'
import { z } from 'zod'
import { metaTags } from '~/helpers'
import Example from '~/ui/example'
import { SchemaForm } from '~/ui/schema-form'
import type { Route } from './+types/form-with-children'

const title = 'Form with children'
const description =
  'In this example, we pass a children function to gain control over the Form UI.'

export const meta: Route.MetaFunction = () => metaTags({ title, description })

const code = `const schema = z.object({
  csrfToken: z.string().min(1),
  firstName: z.string().min(1),
  email: z.string().min(1).email(),
  howDidYouFindUs: z.enum(['aFriend', 'google']),
  message: z.string().optional(),
})

export default () => (
  <SchemaForm schema={schema}>
    {({ Field, Errors, Button }) => (
      <>
        <Field name="csrfToken" value="abc123" hidden />
        <Field name="firstName" placeholder="Your first name" />
        <Field name="email" label="E-mail" placeholder="Your e-mail" />
        <em>You'll hear from us at this address 👆🏽</em>
        <Field
          name="howDidYouFindUs"
          options={[
            { name: 'Friend', value: 'aFriend' },
            { name: 'Search', value: 'google' },
          ]}
          radio
        />
        <Field name="message" multiline placeholder="Your message" />
        <Errors />
        <Button />
      </>
    )}
  </SchemaForm>
)`

const schema = z.object({
  csrfToken: z.string().min(1),
  firstName: z.string().min(1),
  email: z.string().min(1).email(),
  howDidYouFindUs: z.enum(['aFriend', 'google']),
  message: z.string().optional(),
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
      <SchemaForm schema={schema}>
        {({ Field, Errors, Button }) => (
          <>
            <Field name="csrfToken" value="abc123" hidden />
            <Field name="firstName" placeholder="Your first name" />
            <Field name="email" label="E-mail" placeholder="Your e-mail" />
            <em>You&apos;ll hear from us at this address 👆🏽</em>
            <Field
              name="howDidYouFindUs"
              options={[
                { name: 'Friend', value: 'aFriend' },
                { name: 'Search', value: 'google' },
              ]}
              radio
            />
            <Field name="message" multiline placeholder="Your message" />
            <Errors />
            <Button />
          </>
        )}
      </SchemaForm>
    </Example>
  )
}
