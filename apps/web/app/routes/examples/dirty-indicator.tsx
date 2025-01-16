import hljs from 'highlight.js/lib/common'
import { z } from 'zod'
import { SchemaForm } from '~/ui/schema-form'
import { metaTags } from '~/helpers'
import { applySchema } from 'composable-functions'
import Example from '~/ui/example'
import { formAction } from 'remix-forms'
import { Route } from './+types/dirty-indicator'

const title = 'Dirty indicator'
const description =
  'In this example, we use renderField to make labels and borders yellow when the field value has changed.'

export const meta: Route.MetaFunction = () => metaTags({ title, description })

const code = `const schema = z.object({
  email: z.string().email(),
  firstName: z.string().nonempty(),
  preferredSport: z.enum(['Basketball', 'Football', 'Other']),
  newsletter: z.boolean().default(false),
})

export default () => (
  <Example title={title} description={description}>
    <SchemaForm
      values={{ email: 'default@domain.tld', preferredSport: 'Basketball' }}
      schema={schema}
      renderField={({ Field, ...props }) => {
        const { name, dirty } = props

        return (
          <Field key={name} {...props}>
            {({ Label, SmartInput, Errors }) => (
              <>
                <Label className={dirty ? 'text-yellow-600' : undefined} />
                <SmartInput
                  className={
                    dirty
                      ? 'border-yellow-600 focus:border-yellow-600 focus:ring-yellow-600'
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

export default () => (
  <Example title={title} description={description}>
    <SchemaForm
      values={{ email: 'default@domain.tld', preferredSport: 'Basketball' }}
      schema={schema}
      renderField={({ Field, ...props }) => {
        const { name, dirty } = props

        return (
          <Field key={name} {...props}>
            {({ Label, SmartInput, Errors }) => (
              <>
                <Label className={dirty ? 'text-yellow-600' : undefined} />
                <SmartInput
                  className={
                    dirty
                      ? 'border-yellow-600 focus:border-yellow-600 focus:ring-yellow-600'
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
