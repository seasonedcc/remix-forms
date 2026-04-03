import { applySchema } from 'composable-functions'
import hljs from 'highlight.js/lib/common'
import { formAction } from 'remix-forms'
import { z } from 'zod'
import { metaTags } from '~/helpers'
import Example from '~/ui/example'
import { SchemaForm } from '~/ui/schema-form'
import type { Route } from './+types/object-with-children'

const title = 'Object with children'
const description =
  'In this example, the object field uses a children render function with a scoped Field component for custom layout.'

export const meta: Route.MetaFunction = () => metaTags({ title, description })

const code = `const schema = z.object({
  title: z.string().min(1),
  author: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    bio: z.string().optional(),
  }),
})

const mutation = applySchema(schema)(async (values) => values)

export const action = async ({ request }: Route.ActionArgs) =>
  formAction({ request, schema, mutation })

export default () => (
  <SchemaForm schema={schema}>
    {({ Field, Errors, Button }) => (
      <>
        <Field name="title" />
        <Field name="author">
          {({ Title, Field, Errors }) => (
            <>
              <Title>Author details</Title>
              <Field name="name" label="Full name" />
              <Field name="email" />
              <Field name="bio" multiline placeholder="Tell us about yourself" />
              <Errors />
            </>
          )}
        </Field>
        <Errors />
        <Button />
      </>
    )}
  </SchemaForm>
)`

const schema = z.object({
  title: z.string().min(1),
  author: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    bio: z.string().optional(),
  }),
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
            <Field name="title" />
            <Field name="author">
              {({ Title, Field, Errors }) => (
                <>
                  <Title>Author details</Title>
                  <Field name="name" label="Full name" />
                  <Field name="email" />
                  <Field
                    name="bio"
                    multiline
                    placeholder="Tell us about yourself"
                  />
                  <Errors />
                </>
              )}
            </Field>
            <Errors />
            <Button />
          </>
        )}
      </SchemaForm>
    </Example>
  )
}
