import hljs from 'highlight.js/lib/common'
import { z } from 'zod'
import { SchemaForm } from '~/ui/schema-form'
import { metaTags } from '~/helpers'
import { applySchema } from 'composable-functions'
import Example from '~/ui/example'
import { formAction } from 'remix-forms'
import { Route } from './+types/inline-checkboxes'

const title = 'Inline checkboxes'
const description =
  'In this example, we use renderField to add required indicators but render checkboxes inline.'

export const meta: Route.MetaFunction = () => metaTags({ title, description })

const code = `const schema = z.object({
  email: z.string().email(),
  firstName: z.string().optional(),
  preferredSport: z.enum(['Basketball', 'Football', 'Other']),
  newsletter: z.boolean().default(false),
})

export default () => (
  <SchemaForm
    schema={schema}
    renderField={({ Field, ...props }) => {
      const { fieldType, name, label, required } = props

      return (
        <Field key={name} {...props}>
          {({ Label, CheckboxWrapper, SmartInput, Errors }) => {
            const labelElement = (
              <Label>
                {label}
                {required && <sup>*</sup>}
              </Label>
            )

            const inputWithLabel =
              fieldType === 'boolean' ? (
                <CheckboxWrapper>
                  <SmartInput />
                  {labelElement}
                </CheckboxWrapper>
              ) : (
                <>
                  {labelElement}
                  <SmartInput />
                </>
              )

            return (
              <>
                {inputWithLabel}
                <Errors />
              </>
            )
          }}
        </Field>
      )
    }}
  />
)`

const schema = z.object({
  email: z.string().email(),
  firstName: z.string().optional(),
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
      <SchemaForm
        schema={schema}
        renderField={({ Field, ...props }) => {
          const { fieldType, name, label, required } = props

          return (
            <Field key={name} {...props}>
              {({ Label, CheckboxWrapper, SmartInput, Errors }) => {
                const labelElement = (
                  <Label>
                    {label}
                    {required && <sup>*</sup>}
                  </Label>
                )

                const inputWithLabel =
                  fieldType === 'boolean' ? (
                    <CheckboxWrapper>
                      <SmartInput />
                      {labelElement}
                    </CheckboxWrapper>
                  ) : (
                    <>
                      {labelElement}
                      <SmartInput />
                    </>
                  )

                return (
                  <>
                    {inputWithLabel}
                    <Errors />
                  </>
                )
              }}
            </Field>
          )
        }}
      />
    </Example>
  )
}
