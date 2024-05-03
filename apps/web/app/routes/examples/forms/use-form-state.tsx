import hljs from 'highlight.js/lib/common'
import type { ActionFunction, LoaderFunction } from '@remix-run/node'
import { formAction } from '~/formAction'
import { z } from 'zod'
import Form from '~/ui/form'
import { metaTags } from '~/helpers'
import { makeDomainFunction } from 'domain-functions'
import Example from '~/ui/example'
import { useFormState } from 'react-hook-form'
import SubmitButton from '~/ui/submit-button'

const title = 'useFormState'
const description = `In this example, we use the useFormState hook from React Hook Form to access the state of the form in our custom
  components without having to use render props. This makes it easier to have certain functionality in custom components across all forms.`

export const meta = () => metaTags({ title, description })

const code = `const schema = z.object({ age: z.number().min(1) })

const Button = ({ children, ...props }: JSX.IntrinsicElements['button']) => {
  const { isDirty } = useFormState()
  return (
    <SubmitButton {...props} disabled={!isDirty}>
      {children}
    </SubmitButton>
  )
}

export default () => (
    <Form schema={schema} buttonComponent={Button} />
  )
}`

const schema = z.object({ age: z.number().min(1) })

export const loader: LoaderFunction = () => ({
  code: hljs.highlight(code, { language: 'ts' }).value,
})

const mutation = makeDomainFunction(schema)(async (values) => values)

export const action: ActionFunction = async ({ request }) =>
  formAction({ request, schema, mutation })

const Button = ({ children, ...props }: JSX.IntrinsicElements['button']) => {
  const { isDirty } = useFormState()
  return (
    <SubmitButton {...props} disabled={!isDirty}>
      {children}
    </SubmitButton>
  )
}

export default () => (
  <Example title={title} description={description}>
    <Form schema={schema} buttonComponent={Button} />
  </Example>
)
