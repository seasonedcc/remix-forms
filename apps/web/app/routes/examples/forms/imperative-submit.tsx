import hljs from 'highlight.js/lib/common'
import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from '@remix-run/node'
import { formAction } from '@remix-forms/remix'
import { z } from 'zod'
import Form from '~/ui/form'
import { metaTags } from '~/helpers'
import { makeDomainFunction } from 'domain-functions'
import Example from '~/ui/example'

const title = 'Imperative submit'
const description =
  'In this example, we trigger a submit as soon as the user enters 4 characters.'

export const meta: MetaFunction = () => metaTags({ title, description })

const code = `const schema = z.object({ token: z.string().length(4) })

export default () => (
  <Form schema={schema}>
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
  </Form>
)`

const schema = z.object({
  token: z.string().length(4),
})

export const loader: LoaderFunction = () => ({
  code: hljs.highlight(code, { language: 'ts' }).value,
})

const mutation = makeDomainFunction(schema)(async (values) => values)

export const action: ActionFunction = async ({ request }) =>
  formAction({ request, schema, mutation })

export default function Component() {
  return (
    <Example title={title} description={description}>
      <Form schema={schema}>
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
      </Form>
    </Example>
  )
}
