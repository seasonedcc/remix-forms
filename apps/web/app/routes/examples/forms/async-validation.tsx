import hljs from 'highlight.js/lib/common'
import {
  ActionFunction,
  json,
  LoaderFunction,
  MetaFunction,
} from '@remix-run/node'
import { formAction } from 'remix-forms'
import { z } from 'zod'
import Form from '~/ui/form'
import { metaTags } from '~/helpers'
import { InputError, makeDomainFunction } from 'remix-domains'
import Example from '~/ui/example'
import { useFetcher } from '@remix-run/react'

const title = 'Async validation'
const description =
  'In this example, we add an async username avaliability check to our form. We also validate it on the server, of course 🙂'

export const meta: MetaFunction = () => metaTags({ title, description })

const code = `import { InputError } from 'remix-domains'

const schema = z.object({
  username: z.string().nonempty(),
  password: z.string().nonempty(),
})

const takenUsernames = ['foo', 'bar']

export const loader: LoaderFunction = ({ request }) => {
  const url = new URL(request.url)
  const username = url.searchParams.get('username')

  if (username && takenUsernames.includes(username)) {
    return json({ message: 'Already taken' })
  }

  return null
}

const mutation = makeDomainFunction(schema)(async (values) => {
  if (takenUsernames.includes(values.username)) {
    throw new InputError('Already taken', 'username')
  }

  return values
})

export const action: ActionFunction = async ({ request }) =>
  formAction({ request, schema, mutation })

export default function Component() {
  const fetcher = useFetcher()
  const message = fetcher.data?.message

  return (
    <Form schema={schema}>
      {({ Field, Errors, Button, clearErrors }) => (
        <>
          <Field name="username">
            {({ Label, Input, Errors, Error }) => (
              <>
                <Label />
                <Input
                  onChange={(event) => {
                    clearErrors('username')

                    fetcher.load(
                      \`/examples/forms/async-validation?username=\${event.target.value}\`,
                    )
                  }}
                />
                <Errors />
                {message && <Error>{message}</Error>}
              </>
            )}
          </Field>
          <Field name="password" />
          <Errors />
          <Button disabled={message} />
        </>
      )}
    </Form>
  )
}`

const schema = z.object({
  username: z.string().nonempty(),
  password: z.string().nonempty(),
})

const takenUsernames = ['foo', 'bar']

export const loader: LoaderFunction = ({ request }) => {
  const url = new URL(request.url)
  const username = url.searchParams.get('username')

  if (username && takenUsernames.includes(username)) {
    return json({
      code: hljs.highlight(code, { language: 'ts' }).value,
      message: 'Already taken',
    })
  }

  return {
    code: hljs.highlight(code, { language: 'ts' }).value,
  }
}

const mutation = makeDomainFunction(schema)(async (values) => {
  if (takenUsernames.includes(values.username)) {
    throw new InputError('Already taken', 'username')
  }

  return values
})

export const action: ActionFunction = async ({ request }) =>
  formAction({ request, schema, mutation })

export default function Component() {
  const fetcher = useFetcher()
  const message = fetcher.data?.message

  return (
    <Example title={title} description={description}>
      <Form schema={schema}>
        {({ Field, Errors, Button, clearErrors }) => (
          <>
            <Field name="username">
              {({ Label, Input, Errors, Error }) => (
                <>
                  <Label />
                  <Input
                    onChange={(event) => {
                      clearErrors('username')

                      fetcher.load(
                        `/examples/forms/async-validation?username=${event.target.value}`,
                      )
                    }}
                  />
                  <Errors />
                  {message && <Error>{message}</Error>}
                </>
              )}
            </Field>
            <Field name="password" />
            <Errors />
            <Button disabled={message} />
          </>
        )}
      </Form>
    </Example>
  )
}
