import hljs from 'highlight.js/lib/common'
import { ActionFunction, LoaderFunction, MetaFunction } from '@remix-run/node'
import { formAction } from 'remix-forms'
import { z } from 'zod'
import Form from '~/ui/form'
import { metaTags } from '~/helpers'
import { makeDomainFunction } from 'remix-domains'
import Example from '~/ui/example'
import ExternalLink from '~/ui/external-link'

const title = 'Custom input'
const description =
  "In this example, we create a 100% custom input using react-hook-form's register function."

export const meta: MetaFunction = () => metaTags({ title, description })

const code = `const schema = z.object({
  firstName: z.string().nonempty(),
  email: z.string().nonempty().email(),
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
                className="border-2 border-dashed rounded-md"
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
  firstName: z.string().nonempty(),
  email: z.string().nonempty().email(),
})

export const loader: LoaderFunction = () => ({
  code: hljs.highlight(code, { language: 'ts' }).value,
})

const mutation = makeDomainFunction(schema)(async (values) => values)

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
          's <em>register</em> function.
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
                    className="border-2 border-dashed rounded-md"
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
