import hljs from 'highlight.js/lib/common'
import { z } from 'zod'
import { SchemaForm } from '~/ui/schema-form'
import { metaTags } from '~/helpers'
import { InputError, applySchema } from 'composable-functions'
import Example from '~/ui/example'
import { useFetcher } from 'react-router'
import { formAction } from 'remix-forms'
import { Route } from './+types/async-validation'

const title = 'Async validation'
const description =
  'In this example, we add an async username avaliability check to our form. We also validate it on the server, of course 🙂'

export const meta: Route.MetaFunction = () => metaTags({ title, description })

const code = `import { InputError } from 'composable-functions'

const schema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
})

const takenUsernames = ['foo', 'bar']

export const loader = ({ request }: Route.LoaderArgs) => {
  const url = new URL(request.url)
  const username = url.searchParams.get('username')

  if (username && takenUsernames.includes(username)) {
    return { message: 'Already taken' }
  }

  return null
}

const mutation = applySchema(schema)(async (values) => {
  if (takenUsernames.includes(values.username)) {
    throw new InputError('Already taken', ['username'])
  }

  return values
})

export const action = async ({ request }: Route.ActionArgs) =>
  formAction({ request, schema, mutation })

export default function Component() {
  const fetcher = useFetcher<{ message: string }>()
  const message = fetcher.data?.message

  return (
    <SchemaForm schema={schema}>
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
          <Button disabled={Boolean(message)} />
        </>
      )}
    </SchemaForm>
  )
}`

const schema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
})

const takenUsernames = ['foo', 'bar']

export const loader = ({ request }: Route.LoaderArgs) => {
  const url = new URL(request.url)
  const username = url.searchParams.get('username')

  if (username && takenUsernames.includes(username)) {
    return {
      code: hljs.highlight(code, { language: 'ts' }).value,
      message: 'Already taken',
    }
  }

  return {
    code: hljs.highlight(code, { language: 'ts' }).value,
  }
}

const mutation = applySchema(schema)(async (values) => {
  if (takenUsernames.includes(values.username)) {
    throw new InputError('Already taken', ['username'])
  }

  return values
})

export const action = async ({ request }: Route.ActionArgs) =>
  formAction({ request, schema, mutation })

export default function Component() {
  const fetcher = useFetcher<{ message: string }>()
  const message = fetcher.data?.message

  return (
    <Example title={title} description={description}>
      <SchemaForm schema={schema}>
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
            <Button disabled={Boolean(message)} />
          </>
        )}
      </SchemaForm>
    </Example>
  )
}
