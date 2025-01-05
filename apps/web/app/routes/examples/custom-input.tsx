import hljs from 'highlight.js/lib/common'
import type { ActionFunction, LoaderFunction, MetaFunction } from 'react-router'
import { z } from 'zod'
import Form from '~/ui/form'
import { metaTags } from '~/helpers'
import { applySchema } from 'composable-functions'
import Example from '~/ui/example'
import ExternalLink from '~/ui/external-link'
import { formAction } from 'remix-forms'

const title = 'Custom input'
const description =
  "In this example, we create a 100% custom input using react-hook-form's register function."

export const meta: MetaFunction = () => metaTags({ title, description })

const code = `const schema = z.object({
  firstName: z.string().min(1),
  email: z.string().min(1).email(),
})

export default () => (
  <Form schema={schema}>
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
  </Form>
)`

const schema = z.object({
  firstName: z.string().min(1),
  email: z.string().min(1).email(),
})

export const loader: LoaderFunction = () => ({
  code: hljs.highlight(code, { language: 'ts' }).value,
})

const mutation = applySchema(schema)(async (values) => values)

export const action: ActionFunction = async ({ request }) =>
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
      <Form schema={schema}>
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
      </Form>
    </Example>
  )
}
