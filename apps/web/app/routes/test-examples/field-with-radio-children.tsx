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

const title = 'Field with children'
const description =
  'In this example, we pass a children function to gain control over the Field UI.'

export const meta: MetaFunction = () => metaTags({ title, description })

const schema = z.object({
  csrfToken: z.string().min(1),
  firstName: z.string().min(1),
  email: z.string().min(1).email(),
  howYouFoundOutAboutUs: z.enum(['fromAFriend', 'google']),
  message: z.string().optional(),
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
      </Form>
    </Example>
  )
}
