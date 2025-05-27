import { applySchema } from 'composable-functions'
import hljs from 'highlight.js/lib/common'
import { formAction } from 'remix-forms'
import { z } from 'zod/v4'
import { metaTags } from '~/helpers'
import Example from '~/ui/example'
import { SchemaForm } from '~/ui/schema-form'
import type { Route } from './+types/field-layout'

const title = 'Field layout'
const description = 'In this example, we use a custom layout for our fields.'

export const meta: Route.MetaFunction = () => metaTags({ title, description })

const code = `const schema = z.object({
  street: z.string().min(1),
  number: z.string().min(1),
  extendedAddress: z.string().optional(),
  city: z.string().min(1),
  state: z.enum(['Alabama', 'Alaska', 'Arizona']),
})

export default () => (
  <SchemaForm schema={schema} autoFocus="street">
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
  </SchemaForm>
)`

const schema = z.object({
  street: z.string().min(1),
  number: z.string().min(1),
  extendedAddress: z.string().optional(),
  city: z.string().min(1),
  state: z.enum(['Alabama', 'Alaska', 'Arizona']),
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
      <SchemaForm schema={schema} autoFocus="street">
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
      </SchemaForm>
    </Example>
  )
}
