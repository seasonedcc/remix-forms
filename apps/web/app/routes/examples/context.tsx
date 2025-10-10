import { applySchema } from 'composable-functions'
import hljs from 'highlight.js/lib/common'
import { formAction } from 'remix-forms'
import { z } from 'zod'
import { metaTags } from '~/helpers'
import Example from '~/ui/example'
import ExternalLink from '~/ui/external-link'
import { SchemaForm } from '~/ui/schema-form'
import type { Route } from './+types/context'

const title = 'Context'
const description =
  "In this example, we use Composable Function's context to authorize a specific origin."

export const meta: Route.MetaFunction = () => metaTags({ title, description })

const code = `const schema = z.object({ email: z.string().min(1).email() })

const contextSchema = z.object({
  customHeader: z.string({
    error: (issue) =>
      issue.input == null
        ? 'Missing custom header'
        : 'Invalid custom header',
  }),
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

export default () => <SchemaForm schema={schema} />`

const schema = z.object({ email: z.string().min(1).email() })

const contextSchema = z.object({
  customHeader: z.string({
    error: (issue) =>
      issue.input == null ? 'Missing custom header' : 'Invalid custom header',
  }),
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
      <SchemaForm schema={schema} />
    </Example>
  )
}
