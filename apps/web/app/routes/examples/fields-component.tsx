import { applySchema } from 'composable-functions'
import hljs from 'highlight.js/lib/common'
import { formAction } from 'remix-forms'
import { z } from 'zod'
import { metaTags } from '~/helpers'
import Example from '~/ui/example'
import { SchemaForm } from '~/ui/schema-form'
import type { Route } from './+types/fields-component'

const title = 'Fields component'
const description =
  'In this example, we use the Fields component to render all schema fields automatically while customizing the layout and specific fields.'

export const meta: Route.MetaFunction = () => metaTags({ title, description })

const code = `const schema = z.object({
  firstName: z.string().min(1),
  email: z.string().min(1).email(),
  howDidYouFindUs: z.enum(['aFriend', 'google']),
  message: z.string().optional(),
})

export default () => (
  <SchemaForm schema={schema}>
    {({ Field, Fields, Errors, Button }) => (
      <>
        <Fields className="gap-4">
          <Field name="email" label="E-mail" />
          <Field name="message" multiline placeholder="Your message" />
        </Fields>
        <Errors />
        <Button />
      </>
    )}
  </SchemaForm>
)`

const schema = z.object({
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
        {({ Field, Fields, Errors, Button }) => (
          <>
            <Fields className="gap-4">
              <Field name="email" label="E-mail" />
              <Field name="message" multiline placeholder="Your message" />
            </Fields>
            <Errors />
            <Button />
          </>
        )}
      </SchemaForm>
    </Example>
  )
}
