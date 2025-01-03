import hljs from 'highlight.js/lib/common'
import type { ActionFunction, LoaderFunction, MetaFunction } from 'react-router';
import { formAction } from '~/formAction'
import { z } from 'zod'
import Form from '~/ui/form'
import { metaTags } from '~/helpers'
import { makeDomainFunction } from 'domain-functions'
import Example from '~/ui/example'
import { useFetcher } from 'react-router';

const title = "Fetcher with other form's error"
const description =
  'In this example, we ensure that errors in action data are not show in forms with fetcher.'

export const meta: MetaFunction = () => metaTags({ title, description })

const schema = z.object({
  field: z.string(),
})

const fetcherSchema = z.object({
  fetcherField: z.string(),
})

export const loader: LoaderFunction = () => ({
  code: hljs.highlight('', { language: 'ts' }).value,
})

const mutation = makeDomainFunction(schema)(async () => {
  throw new Error('This error should not show inside the fetcher form')
})

export const action: ActionFunction = async ({ request }) =>
  formAction({ request, schema, mutation })

export default function Component() {
  const fetcher = useFetcher()

  return (
    <Example title={title} description={description}>
      <Form schema={schema} id="form" />
      <Form schema={fetcherSchema} fetcher={fetcher} id="fetcher-form" />
    </Example>
  )
}
