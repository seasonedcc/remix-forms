import hljs from 'highlight.js/lib/common'
import { ActionFunction, LoaderFunction, MetaFunction } from '@remix-run/node'
import { formAction } from 'remix-forms'
import { z } from 'zod'
import Form from '~/ui/form'
import { metaTags } from '~/helpers'
import { makeDomainFunction } from 'remix-domains'
import Example from '~/ui/example'

const title = 'Inline checkboxes'
const description =
  'In this example, we use renderField to add required indicators but render checkboxes inline.'

export const meta: MetaFunction = () => metaTags({ title, description })

const code = `const schema = z.object({
  email: z.string().email(),
  firstName: z.string().optional(),
  preferredSport: z.enum(['Basketball', 'Football', 'Other']),
  newsletter: z.boolean().default(false),
})

export default () => (
  <Form
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

export const loader: LoaderFunction = () => ({
  code: hljs.highlight(code, { language: 'ts' }).value,
})

const mutation = makeDomainFunction(schema)(async (values) => values)

export const action: ActionFunction = async ({ request }) =>
  formAction({ request, schema, mutation })

export default function Component() {
  return (
    <Example title={title} description={description}>
      <Form
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
