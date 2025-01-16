import hljs from 'highlight.js/lib/common'
import { z } from 'zod'
import { SchemaForm } from '~/ui/schema-form'
import { metaTags } from '~/helpers'
import { applySchema } from 'composable-functions'
import Example from '~/ui/example'
import { useFetcher } from 'react-router'
import { formAction } from 'remix-forms'
import { Route } from './+types/fetcher-with-other-forms-error'

const title = "Fetcher with other form's error"
const description =
  'In this example, we ensure that errors in action data are not show in forms with fetcher.'

export const meta: Route.MetaFunction = () => metaTags({ title, description })

const schema = z.object({
  field: z.string(),
})

const fetcherSchema = z.object({
  fetcherField: z.string(),
})

export const loader = () => ({
  code: hljs.highlight('', { language: 'ts' }).value,
})

const mutation = applySchema(schema)(async () => {
  throw new Error('This error should not show inside the fetcher form')
})

export const action = async ({ request }: Route.ActionArgs) =>
  formAction({ request, schema, mutation })

export default function Component() {
  const fetcher = useFetcher()

  return (
    <Example title={title} description={description}>
      <SchemaForm schema={schema} id="form" />
      <SchemaForm schema={fetcherSchema} fetcher={fetcher} id="fetcher-form" />
    </Example>
  )
}
