import hljs from 'highlight.js/lib/common'
import { ActionFunction, LoaderFunction, MetaFunction } from '@remix-run/node'
import { formAction } from 'remix-forms'
import { z } from 'zod'
import Form from '~/ui/form'
import { metaTags } from '~/helpers'
import { makeDomainFunction } from 'remix-domains'
import Example from '~/ui/example'

const title = 'Field layout'
const description = 'In this example, we use a custom layout for our fields.'

export const meta: MetaFunction = () => metaTags({ title, description })

const code = `const schema = z.object({
  street: z.string().nonempty(),
  number: z.string().nonempty(),
  extendedAddress: z.string().optional(),
  city: z.string().nonempty(),
  state: z.enum(['Alabama', 'Alaska', 'Arizona']),
})

export default () => (
  <Form schema={schema}>
    {({ Field, Errors, Button }) => (
      <>
        <div className="flex space-x-4">
          <Field name="street" className="flex-[3]" />
          <Field name="number" className="flex-[1]" />
        </div>
        <Field name="extendedAddress" />
        <div className="flex space-x-4">
          <Field name="city" className="flex-1" />
          <Field name="state" />
        </div>
        <Errors />
        <Button />
      </>
    )}
  </Form>
)`

const schema = z.object({
  street: z.string().nonempty(),
  number: z.string().nonempty(),
  extendedAddress: z.string().optional(),
  city: z.string().nonempty(),
  state: z.enum(['Alabama', 'Alaska', 'Arizona']),
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
            <div className="flex space-x-4">
              <Field name="street" className="flex-[3]" />
              <Field name="number" className="flex-[1]" />
            </div>
            <Field name="extendedAddress" />
            <div className="flex space-x-4">
              <Field name="city" className="flex-1" />
              <Field name="state" />
            </div>
            <Errors />
            <Button />
          </>
        )}
      </Form>
    </Example>
  )
}
