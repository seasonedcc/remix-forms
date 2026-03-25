import { applySchema } from 'composable-functions'
import hljs from 'highlight.js/lib/common'
import { formAction } from 'remix-forms'
import { z } from 'zod'
import { metaTags } from '~/helpers'
import Example from '~/ui/example'
import { SchemaForm } from '~/ui/schema-form'
import type { Route } from './+types/custom-wrapper'

const title = 'Custom wrapper'
const description =
  'In this example, we use renderForm to wrap the auto-generated fields in a styled container.'

export const meta: Route.MetaFunction = () => metaTags({ title, description })

const code = `const schema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  preferredSport: z.enum(['Basketball', 'Football', 'Other']),
  newsletter: z.boolean().default(false),
})

export default () => (
  <SchemaForm
    schema={schema}
    renderForm={({ Fields, Errors, Button }) => (
      <>
        <fieldset className="rounded-lg border border-gray-600 p-6">
          <legend className="px-2 text-sm text-gray-400">
            Your details
          </legend>
          <Fields />
        </fieldset>
        <Errors />
        <Button />
      </>
    )}
  />
)`

const schema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  preferredSport: z.enum(['Basketball', 'Football', 'Other']),
  newsletter: z.boolean().default(false),
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
      <SchemaForm
        schema={schema}
        renderForm={({ Fields, Errors, Button }) => (
          <>
            <fieldset className="rounded-lg border border-gray-600 p-6">
              <legend className="px-2 text-gray-400 text-sm">
                Your details
              </legend>
              <Fields />
            </fieldset>
            <Errors />
            <Button />
          </>
        )}
      />
    </Example>
  )
}
