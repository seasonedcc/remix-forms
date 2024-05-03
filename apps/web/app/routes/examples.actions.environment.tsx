import hljs from 'highlight.js/lib/common'
import type { ActionFunction, LoaderFunction } from '@remix-run/node'
import { formAction } from '~/formAction'
import { z } from 'zod'
import Form from '~/ui/form'
import { metaTags } from '~/helpers'
import { makeDomainFunction } from 'domain-functions'
import Example from '~/ui/example'
import ExternalLink from '~/ui/external-link'

const title = 'Environment'
const description =
  "In this example, we use Remix Domain's environment to authorize a specific origin."

export const meta = () => metaTags({ title, description })

const code = `const schema = z.object({ email: z.string().min(1).email() })

const environmentSchema = z.object({
  customHeader: z.string({ invalid_type_error: 'Missing custom header' }),
})

const mutation = makeDomainFunction(
  schema,
  environmentSchema,
)(async (values) => values)

export const action: ActionFunction = async ({ request }) => {
  return formAction({
    request,
    schema,
    mutation,
    environment: { customHeader: request.headers.get('customHeader') },
  })
}

export default () => <Form schema={schema} />`

const schema = z.object({ email: z.string().min(1).email() })

const environmentSchema = z.object({
  customHeader: z.string({ invalid_type_error: 'Missing custom header' }),
})

export const loader: LoaderFunction = () => ({
  code: hljs.highlight(code, { language: 'ts' }).value,
})

const mutation = makeDomainFunction(
  schema,
  environmentSchema,
)(async (values) => values)

export const action: ActionFunction = async ({ request }) => {
  return formAction({
    request,
    schema,
    mutation,
    environment: { customHeader: request.headers.get('customHeader') },
  })
}

export default function Component() {
  return (
    <Example
      title={title}
      description={
        <>
          In this example, we use Remix Domain&apos;s{' '}
          <ExternalLink href="https://github.com/seasonedcc/domain-functions#taking-parameters-that-are-not-user-input">
            environment
          </ExternalLink>{' '}
          to authorize a specific header.
        </>
      }
    >
      <Form schema={schema} />
    </Example>
  )
}
