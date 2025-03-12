import { applySchema } from 'composable-functions'
import hljs from 'highlight.js/lib/common'
import { formAction } from 'remix-forms'
import { z } from 'zod'
import { metaTags } from '~/helpers'
import Example from '~/ui/example'
import { SchemaForm } from '~/ui/schema-form'
import type { Route } from './+types/imperative-submit'

const title = 'Imperative submit'
const description =
  'In this example, we trigger a submit as soon as the user enters 4 characters.'

export const meta: Route.MetaFunction = () => metaTags({ title, description })

const code = `const schema = z.object({ token: z.string().length(4) })

export default () => (
  <SchemaForm schema={schema}>
    {({ Field, Errors, submit }) => (
      <>
        <Field
          name="token"
          onChange={(ev: React.ChangeEvent<HTMLInputElement>) => {
            if (ev.target.value.length === 4) submit()
          }}
        />
        <Errors />
      </>
    )}
  </SchemaForm>
)`

const schema = z.object({
  token: z.string().length(4),
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
      <SchemaForm schema={schema}>
        {({ Field, Errors, submit }) => (
          <>
            <Field
              name="token"
              placeholder="Type 4 digits"
              onChange={(ev: React.ChangeEvent<HTMLInputElement>) => {
                if (ev.target.value.length === 4) submit()
              }}
            />
            <Errors />
          </>
        )}
      </SchemaForm>
    </Example>
  )
}
