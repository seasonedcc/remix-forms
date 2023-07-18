import hljs from 'highlight.js/lib/common'
import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from '@remix-run/node'
import { formAction } from '~/formAction'
import { z } from 'zod'
import Form from '~/ui/form'
import { metaTags } from '~/helpers'
import { makeDomainFunction } from 'domain-functions'
import Example from '~/ui/example'

const title = 'Field with autocomplete'
const description =
  'In this example, we pass a autocomplete prop to a field without children.'

export const meta: MetaFunction = () => metaTags({ title, description })

const schema = z.object({
  name: z.string().min(1),
  code: z.number().int().optional(),
  organization: z.string().optional(),
  organizationTitle: z.enum(['director', 'manager', 'employee']),
  streetAddress: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  addressLine1: z.string().optional(),
})

export const loader: LoaderFunction = () => ({
  code: hljs.highlight('', { language: 'ts' }).value,
})

const mutation = makeDomainFunction(schema)(async (values) => values)

export const action: ActionFunction = async ({ request }) =>
  formAction({ request, schema, mutation })

export default function Component() {
  return (
    <Example title={title} description={description}>
      <Form schema={schema}>
        {({ Field, Errors, Button }) => (
          <>
            {/* Text field */}
            <Field name="name" autoComplete="name" />
            {/* Numeric field */}
            <Field name="code">
              {({ Label, Input, Errors }) => (
                <>
                  <Label>Code</Label>
                  <Input type="number" autoComplete="one-time-code" />
                  <Errors />
                </>
              )}
            </Field>
            {/* Select field */}
            <Field name="organizationTitle" autoComplete="organization-title" />
            {/* Textarea field */}
            <Field
              name="streetAddress"
              multiline
              autoComplete="street-address"
            />
            {/* Text field child */}
            <Field name="organization" autoComplete="organization">
              {({ Label, Input, Errors }) => (
                <>
                  <Label>Organization</Label>
                  <Input autoComplete="organization" />
                  <Errors />
                </>
              )}
            </Field>
            {/* Smart input child*/}
            <Field name="country">
              {({ Label, SmartInput, Errors }) => (
                <>
                  <Label>Country</Label>
                  <SmartInput autoComplete="country" />
                  <Errors />
                </>
              )}
            </Field>
            {/* Select child */}
            <Field name="postalCode">
              {({ Label, Select, Errors }) => (
                <>
                  <Label>Postal code</Label>
                  <Select autoComplete="postal-code">
                    <option value="12345">12345</option>
                    <option value="67890">67890</option>
                  </Select>
                  <Errors />
                </>
              )}
            </Field>
            {/* Textarea child */}
            <Field name="addressLine1">
              {({ Label, Multiline, Errors }) => (
                <>
                  <Label>Postal code</Label>
                  <Multiline autoComplete="address-line1" />

                  <Errors />
                </>
              )}
            </Field>
            <Errors />
            <Button />
          </>
        )}
      </Form>
    </Example>
  )
}
