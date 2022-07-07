import hljs from 'highlight.js/lib/common'
import type { ActionFunction, LoaderFunction, MetaFunction } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { formAction } from 'remix-forms'
import { z } from 'zod'
import Form from '~/ui/form'
import {
  BeakerIcon,
  ScaleIcon,
  ShieldCheckIcon,
  CloudIcon,
  ClipboardCheckIcon,
  CursorClickIcon,
} from '@heroicons/react/solid'
import Feature from '~/ui/feature'
import ButtonLink from '~/ui/button-link'
import Heading from '~/ui/heading'
import Code from '~/ui/code'
import { metaTags } from '~/helpers'
import { makeDomainFunction } from 'remix-domains'

const title = 'Magically create forms + actions in Remix'
const description =
  'All type-safe, with client + server validations, a11y, pending UI, and focus management'

export const meta: MetaFunction = () => metaTags({ title, description })

const code = `import { z } from 'zod'
import { makeDomainFunction } from 'remix-domains'
import { formAction, Form } from 'remix-forms'

const schema = z.object({
  firstName: z.string().nonempty(),
  email: z.string().nonempty().email(),
  howYouFoundOutAboutUs: z.enum(['fromAFriend', 'google']),
})

const mutation = makeDomainFunction(schema)(async (values) => value)

export const action: ActionFunction = async ({ request }) =>
  formAction({
    request,
    schema,
    mutation,
    successPath: '/success',
  })

export default () => <Form schema={schema} />`

const schema = z.object({
  firstName: z.string().nonempty(),
  email: z.string().nonempty().email(),
  howYouFoundOutAboutUs: z.enum(['fromAFriend', 'google']),
})

export const loader: LoaderFunction = () => ({
  code: hljs.highlight(code, { language: 'ts' }).value,
})

const mutation = makeDomainFunction(schema)(async (values) => values)

export const action: ActionFunction = async ({ request }) =>
  formAction({
    request,
    schema,
    mutation,
    successPath: '/success',
  })

export default function Component() {
  const { code } = useLoaderData()

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8 sm:py-16">
      <div className="flex flex-col space-y-8 sm:space-y-16">
        <Heading className="text-center">
          Magically create forms
          <br />+ actions in Remix
        </Heading>
        <div className="flex flex-col space-y-6 space-x-0 xl:flex-row xl:space-x-6 xl:space-y-0">
          <Code>{code}</Code>
          <div className="xl:flex-1">
            <h3 className="pb-6 text-center text-lg text-gray-400">
              This tiny code creates the form below 👇🏽
            </h3>
            <h2 className="pb-6 text-center text-xl text-white md:text-3xl">
              All{' '}
              <span className="underline decoration-green-500">type-safe</span>,
              with client + server{' '}
              <span className="underline decoration-purple-500">
                validations
              </span>
              , <span className="underline decoration-orange-500">a11y</span>,{' '}
              <span className="underline decoration-blue-500">pending UI</span>,
              and{' '}
              <span className="underline decoration-yellow-500">
                focus management
              </span>
            </h2>
            <Form schema={schema}>
              {({ Field, Errors, Button }) => (
                <>
                  <Field name="firstName" />
                  <Field name="email" />
                  <Field name="howYouFoundOutAboutUs" />
                  <Errors />
                  <div className="flex items-center space-x-4">
                    <h4 className="flex-1 text-center text-gray-500">
                      (Go ahead, try it with JS disabled as well 😉)
                    </h4>
                    <Button />
                  </div>
                </>
              )}
            </Form>
          </div>
        </div>
        <dl className="auto-rows-min space-y-8 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-8 md:space-y-0 xl:grid-cols-3">
          <Feature icon={BeakerIcon} title="100% customizable UI">
            Customize everything without losing our accessible defaults.
          </Feature>
          <Feature icon={ScaleIcon} title="Single source of truth">
            Write your schema once and derive everything else from it.
          </Feature>
          <Feature icon={ShieldCheckIcon} title="Bulletproof DX">
            100% typed to your schema. Goodbye typos, hello autocomplete!
          </Feature>
          <Feature icon={CloudIcon} title="Server-side wiring">
            Perform secure server-side mutations with zero boilerplate.
          </Feature>
          <Feature icon={ClipboardCheckIcon} title="Fullstack validation">
            Validate everything both on the client and the server.
          </Feature>
          <Feature icon={CursorClickIcon} title="Focus management">
            Focus on the first field with error even for server-side failures.
          </Feature>
        </dl>
        <div className="flex justify-center">
          <ButtonLink to="/get-started">Get Started</ButtonLink>
        </div>
      </div>
    </div>
  )
}
