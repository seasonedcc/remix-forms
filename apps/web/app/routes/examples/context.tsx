import hljs from 'highlight.js/lib/common'
import { z } from 'zod'
import Form from '~/ui/form'
import { metaTags } from '~/helpers'
import { applySchema } from 'composable-functions'
import Example from '~/ui/example'
import ExternalLink from '~/ui/external-link'
import { formAction } from 'remix-forms'
import { Route } from './+types/context'

const title = 'Context'
const description =
  "In this example, we use Composable Function's context to authorize a specific origin."

export const meta: Route.MetaFunction = () => metaTags({ title, description })

const code = `const schema = z.object({ email: z.string().min(1).email() })

const contextSchema = z.object({
  customHeader: z.string({ invalid_type_error: 'Missing custom header' }),
})

const mutation = applySchema(
  schema,
  contextSchema,
)(async (values) => values)

export const action = async ({ request }: Route.ActionArgs) => {
  return formAction({
    request,
    schema,
    mutation,
    context: { customHeader: request.headers.get('customHeader') },
  })
}

export default () => <Form schema={schema} />`

const schema = z.object({ email: z.string().min(1).email() })

const contextSchema = z.object({
  customHeader: z.string({ invalid_type_error: 'Missing custom header' }),
})

export const loader = () => ({
  code: hljs.highlight(code, { language: 'ts' }).value,
})

const mutation = applySchema(schema, contextSchema)(async (values) => values)

export const action = async ({ request }: Route.ActionArgs) => {
  return formAction({
    request,
    schema,
    mutation,
    context: { customHeader: request.headers.get('customHeader') },
  })
}

export default function Component() {
  return (
    <Example
      title={title}
      description={
        <>
          In this example, we use Composable Function&apos;s{' '}
          <ExternalLink href="https://github.com/seasonedcc/composable-functions/blob/main/context.md">
            context
          </ExternalLink>{' '}
          to authorize a specific header.
        </>
      }
    >
      <Form schema={schema} />
    </Example>
  )
}
