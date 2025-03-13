import { applySchema } from 'composable-functions'
import hljs from 'highlight.js/lib/common'
import { formAction } from 'remix-forms'
import { z } from 'zod'
import { metaTags } from '~/helpers'
import Example from '~/ui/example'
import ExternalLink from '~/ui/external-link'
import { SchemaForm } from '~/ui/schema-form'
import type { Route } from './+types/custom-input'

const title = 'Custom input'
const description =
  "In this example, we create a 100% custom input using react-hook-form's register function."

export const meta: Route.MetaFunction = () => metaTags({ title, description })

const code = `const schema = z.object({
  firstName: z.string().min(1),
  email: z.string().min(1).email(),
})

export default () => (
  <SchemaForm schema={schema}>
    {({ Field, Errors, Button, register }) => (
      <>
        <Field name="firstName" />
        <Field name="email">
          {({ Label, Errors }) => (
            <>
              <Label />
              <input
                type="email"
                {...register('email')}
                className="rounded-md border-2 border-dashed"
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
)`

const schema = z.object({
  firstName: z.string().min(1),
  email: z.string().min(1).email(),
})

export const loader = () => ({
  code: hljs.highlight(code, { language: 'ts' }).value,
})

const mutation = applySchema(schema)(async (values) => values)

export const action = async ({ request }: Route.ActionArgs) =>
  formAction({ request, schema, mutation })

export default function Component() {
  return (
    <Example
      title={title}
      description={
        <>
          In this example, we create a 100% custom input using{' '}
          <ExternalLink href="https://react-hook-form.com/">
            react-hook-form
          </ExternalLink>
          &apos;s <em>register</em> function.
        </>
      }
    >
      <SchemaForm schema={schema}>
        {({ Field, Errors, Button, register }) => (
          <>
            <Field name="firstName" />
            <Field name="email">
              {({ Label, Errors }) => (
                <>
                  <Label />
                  <input
                    type="email"
                    {...register('email')}
                    className="rounded-md border-2 border-dashed"
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
