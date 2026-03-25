import { applySchema } from 'composable-functions'
import hljs from 'highlight.js/lib/common'
import * as React from 'react'
import { Form, useNavigation } from 'react-router'
import { formAction, makeSchemaForm } from 'remix-forms'
import { z } from 'zod'
import { metaTags } from '~/helpers'
import Checkbox from '~/ui/checkbox'
import CheckboxLabel from '~/ui/checkbox-label'
import Error from '~/ui/error'
import Errors from '~/ui/errors'
import Example from '~/ui/example'
import Field from '~/ui/field'
import Fields from '~/ui/fields'
import Input from '~/ui/input'
import Label from '~/ui/label'
import Radio from '~/ui/radio'
import RadioGroup from '~/ui/radio-group'
import RadioLabel from '~/ui/radio-label'
import Select from '~/ui/select'
import SubmitButton from '~/ui/submit-button'
import TextArea from '~/ui/text-area'
import type { Route } from './+types/global-layout'

const title = 'Global layout'
const description =
  'In this example, we use makeSchemaForm to set a global renderForm layout with inverted colors that applies to all forms created with this factory.'

export const meta: Route.MetaFunction = () => metaTags({ title, description })

const code = `const SchemaForm = makeSchemaForm(
  { /* your custom components */ },
  {
    renderForm: ({ Fields, Errors, Button, buttonLabel, disabled }) => {
      const navigation = useNavigation()
      const pending = navigation.state !== 'idle'

      return (
        <div className="rounded-box bg-base-100 p-8 shadow-lg invert">
          <Fields />
          <Errors />
          <Button disabled={disabled}>
            {pending ? 'Submitting...' : buttonLabel}
          </Button>
        </div>
      )
    },
  }
)

// Every form now gets the custom layout automatically
<SchemaForm schema={schema} />`

const StyledForm = React.forwardRef<
  HTMLFormElement,
  React.ComponentPropsWithRef<typeof Form>
>((props, ref) => <Form ref={ref} className="flex flex-col gap-6" {...props} />)

const GlobalSchemaForm = makeSchemaForm(
  {
    form: StyledForm,
    fields: Fields,
    field: Field,
    label: Label,
    input: Input,
    multiline: TextArea,
    select: Select,
    radio: Radio,
    radioGroup: RadioGroup,
    radioLabel: RadioLabel,
    checkboxLabel: CheckboxLabel,
    checkbox: Checkbox,
    button: SubmitButton,
    globalErrors: Errors,
    error: Error,
  },
  {
    renderForm: ({ Fields, Errors, Button, buttonLabel, disabled }) => {
      const navigation = useNavigation()
      const pending = navigation.state !== 'idle'

      return (
        <div className="rounded-box bg-base-100 p-8 shadow-lg invert">
          <Fields />
          <Errors />
          <Button disabled={disabled}>
            {pending ? 'Submitting...' : buttonLabel}
          </Button>
        </div>
      )
    },
  }
)

const schema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  preferredSport: z.enum(['Basketball', 'Football', 'Other']),
  newsletter: z.boolean().default(false),
})

export const loader = () => ({
  code: hljs.highlight(code, { language: 'ts' }).value,
})

const mutation = applySchema(schema)(async (values) => values)

export const action = async ({ request }: Route.ActionArgs) =>
  formAction({ request, schema, mutation })

export default function Component() {
  return (
    <Example title={title} description={description}>
      <GlobalSchemaForm schema={schema} />
    </Example>
  )
}
