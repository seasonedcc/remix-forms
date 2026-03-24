import { applySchema } from 'composable-functions'
import hljs from 'highlight.js/lib/common'
import { formAction } from 'remix-forms'
import { z } from 'zod'
import { metaTags } from '~/helpers'
import Example from '~/ui/example'
import { SchemaForm } from '~/ui/schema-form'
import type { Route } from './+types/fields-component'

const title = 'Fields component'
const description = 'Test route for the Fields component.'

export const meta: Route.MetaFunction = () => metaTags({ title, description })

const schema = z.object({
  firstName: z.string().min(1),
  email: z.string().min(1).email(),
  message: z.string().optional(),
})

export const loader = () => ({
  code: hljs.highlight('', { language: 'ts' }).value,
})

const mutation = applySchema(schema)(async (values) => values)

export const action = async ({ request }: Route.ActionArgs) =>
  formAction({ request, schema, mutation })

export default function Component() {
  return (
    <Example title={title} description={description}>
      <SchemaForm schema={schema}>
        {({ Field, Fields, Errors, Button }) => (
          <>
            <Fields>
              <Field name="email" label="E-mail" />
            </Fields>
            <Errors />
            <Button />
          </>
        )}
      </SchemaForm>
    </Example>
  )
}
