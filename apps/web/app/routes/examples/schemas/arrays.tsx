import hljs from 'highlight.js/lib/common'
import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from '@remix-run/node'
import { formAction } from 'remix-forms'
import {string, z} from 'zod'
import Form from '~/ui/form'
import { metaTags } from '~/helpers'
import { makeDomainFunction } from 'remix-domains'
import Example from '~/ui/example'

const title = 'Arrays'
const description =
  'In this example, all sorts of array schemas are validated on the client and on the server.'

export const meta: MetaFunction = () => metaTags({ title, description })

//

const code = "import {formAction} from 'remix-forms'";

//

const schema = z.object({
  reallyCoolArray: z.string().array().default(['a', 'b', 'c']),
})

export const loader: LoaderFunction = () => ({
  code: hljs.highlight(code, { language: 'ts' }).value,
})

const mutation = makeDomainFunction(schema)(async (values) => {
  return values
})

export const action: ActionFunction = async ({ request }) => {
  return formAction({ request, schema, mutation })}

export default function Component() {
  return (
    <Example title={title} description={description}>
      <Form schema={schema} />
    </Example>
  )
}
