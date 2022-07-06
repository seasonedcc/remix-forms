import hljs from 'highlight.js/lib/common'
import { ActionFunction, LoaderFunction, MetaFunction } from '@remix-run/node'
import { formAction } from 'remix-forms'
import { z } from 'zod'
import Form from '~/ui/form'
import { metaTags } from '~/helpers'
import { makeDomainFunction } from 'remix-domains'
import Example from '~/ui/example'

const title = 'Field with children'
const description =
  'In this example, we pass a children function to gain control over the Field UI.'

export const meta: MetaFunction = () => metaTags({ title, description })

const code = `const schema = z.object({
  firstName: z.string().nonempty(),
  email: z.string().nonempty().email(),
})

export default () => (
  <Form schema={schema}>
    {({ Field, Errors, Button }) => (
      <>
        <Field name="firstName" />
        <Field name="email">
          {({ Label, SmartInput, Errors }) => (
            <>
              <Label>E-mail</Label>
              <em>You'll hear from us at this address 👇🏽</em>
              <SmartInput />
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
    <Example title={title} description={description}>
      <Form schema={schema}>
        {({ Field, Errors, Button }) => (
          <>
            <Field name="firstName" />
            <Field name="email">
              {({ Label, SmartInput, Errors }) => (
                <>
                  <Label>E-mail</Label>
                  <em>You'll hear from us at this address 👇🏽</em>
                  <SmartInput />
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
