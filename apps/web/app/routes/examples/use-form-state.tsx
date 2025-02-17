import hljs from 'highlight.js/lib/common'
import { z } from 'zod'
import { SchemaForm } from '~/ui/schema-form'
import { metaTags } from '~/helpers'
import { applySchema } from 'composable-functions'
import Example from '~/ui/example'
import { useFormState } from 'react-hook-form'
import SubmitButton from '~/ui/submit-button'
import { formAction } from 'remix-forms'
import { Route } from './+types/use-form-state'

const title = 'useFormState'
const description = `In this example, we use the useFormState hook from React Hook Form to access the state of the form in our custom
  components without having to use render props. This makes it easier to have certain functionality in custom components across all forms.`

export const meta: Route.MetaFunction = () => metaTags({ title, description })

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
    <SchemaForm schema={schema} buttonComponent={Button} />
  )
}`

const schema = z.object({ age: z.number().min(1) })

export const loader = () => ({
  code: hljs.highlight(code, { language: 'ts' }).value,
})

const mutation = applySchema(schema)(async (values) => values)

export const action = async ({ request }: Route.ActionArgs) =>
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
    <SchemaForm schema={schema} buttonComponent={Button} />
  </Example>
)
