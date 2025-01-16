import hljs from 'highlight.js/lib/common'
import { z } from 'zod'
import { SchemaForm } from '~/ui/schema-form'
import { metaTags } from '~/helpers'
import { applySchema } from 'composable-functions'
import Example from '~/ui/example'
import { formAction } from 'remix-forms'
import { Route } from './+types/field-with-radio-children'

const title = 'Field with children'
const description =
  'In this example, we pass a children function to gain control over the Field UI.'

export const meta: Route.MetaFunction = () => metaTags({ title, description })

const schema = z.object({
  csrfToken: z.string().min(1),
  firstName: z.string().min(1),
  email: z.string().min(1).email(),
  howYouFoundOutAboutUs: z.enum(['fromAFriend', 'google']),
  message: z.string().optional(),
})

export const loader = () => ({
  code: hljs.highlight('', { language: 'ts' }).value,
})

const mutation = applySchema(schema)(async (values) => values)

export const action = async ({ request }: Route.ActionArgs) =>
  formAction({ request, schema, mutation })

export default function Component() {
  return (
    <Example title={title} description={description}>
      <SchemaForm schema={schema}>
        {({ Field, Errors, Button }) => (
          <>
            <Field name="csrfToken" value="abc123" hidden />
            <Field name="firstName" placeholder="Your first name" />
            <Field name="email" label="E-mail" placeholder="Your e-mail" />
            <em>You&apos;ll hear from us at this address 👆🏽</em>
            <Field name="howYouFoundOutAboutUs">
              {({ Label, RadioGroup, RadioWrapper, Radio }) => (
                <>
                  <Label />
                  <RadioGroup>
                    <RadioWrapper>
                      <Radio value="google" />
                      <Label>Google</Label>
                    </RadioWrapper>
                    <RadioWrapper>
                      <Radio value="fromAFriend" />
                      <Label>From a friend</Label>
                    </RadioWrapper>
                  </RadioGroup>
                </>
              )}
            </Field>
            <Field name="message" multiline placeholder="Your message" />
            <Errors />
            <Button>
              <span>OK</span>
            </Button>
          </>
        )}
      </SchemaForm>
    </Example>
  )
}
