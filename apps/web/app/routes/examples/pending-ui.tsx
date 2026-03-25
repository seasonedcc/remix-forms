import { applySchema } from 'composable-functions'
import hljs from 'highlight.js/lib/common'
import { useNavigation } from 'react-router'
import { formAction } from 'remix-forms'
import { z } from 'zod'
import { metaTags } from '~/helpers'
import Example from '~/ui/example'
import { SchemaForm } from '~/ui/schema-form'
import type { Route } from './+types/pending-ui'

const title = 'Pending UI'
const description =
  'In this example, we use renderForm to show a loading indicator on the submit button while the form is being submitted.'

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
    renderForm={({ Fields, Errors, Button, buttonLabel, disabled }) => {
      const navigation = useNavigation()
      const pending = navigation.state !== 'idle'

      return (
        <>
          <Fields />
          <Errors />
          <Button disabled={disabled}>
            {pending ? 'Submitting...' : buttonLabel}
          </Button>
        </>
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
        renderForm={({ Fields, Errors, Button, buttonLabel, disabled }) => {
          const navigation = useNavigation()
          const pending = navigation.state !== 'idle'

          return (
            <>
              <Fields />
              <Errors />
              <Button disabled={disabled}>
                {pending ? 'Submitting...' : buttonLabel}
              </Button>
            </>
          )
        }}
      />
    </Example>
  )
}
