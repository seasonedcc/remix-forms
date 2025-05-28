import { applySchema } from 'composable-functions'
import hljs from 'highlight.js/lib/common'
import { formAction } from 'remix-forms'
import { z } from 'zod'
import { metaTags } from '~/helpers'
import Example from '~/ui/example'
import { SchemaForm } from '~/ui/schema-form'
import type { Route } from './+types/error-indicator'

const title = 'Error indicator'
const description =
  'In this example, we use renderField to make labels and borders red when there is an error.'

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
    renderField={({ Field, ...props }) => {
      const { name, errors } = props

      return (
        <Field key={String(name)} {...props}>
          {({ Label, SmartInput, Errors }) => (
            <>
              <Label className={errors ? 'text-red-600' : undefined} />
              <SmartInput
                className={
                  errors
                    ? 'border-red-600 focus:border-red-600 focus:ring-red-600'
                    : undefined
                }
              />
              <Errors />
            </>
          )}
        </Field>
      )
    }}
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
        renderField={({ Field, ...props }) => {
          const { name, errors } = props

          return (
            <Field key={String(name)} {...props}>
              {({ Label, SmartInput, Errors }) => (
                <>
                  <Label className={errors ? 'text-red-600' : undefined} />
                  <SmartInput
                    className={
                      errors
                        ? 'border-red-600 focus:border-red-600 focus:ring-red-600'
                        : undefined
                    }
                  />
                  <Errors />
                </>
              )}
            </Field>
          )
        }}
      />
    </Example>
  )
}
