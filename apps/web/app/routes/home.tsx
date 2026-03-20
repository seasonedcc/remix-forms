import { applySchema } from 'composable-functions'
import hljs from 'highlight.js/lib/common'
import {
  ClipboardCheck,
  Cloud,
  FlaskConical,
  MousePointerClick,
  Scale,
  ShieldCheck,
} from 'lucide-react'
import { Link } from 'react-router'
import { formAction } from 'remix-forms'
import { z } from 'zod'
import { metaTags } from '~/helpers'
import Code from '~/ui/code'
import ExternalLink from '~/ui/external-link'
import Feature from '~/ui/feature'
import Heading from '~/ui/heading'
import { SchemaForm } from '~/ui/schema-form'
import type { Route } from './+types/home'

const title = 'The full-stack form library for React Router v7'

const description =
  'E2E type-safe, with client + server validations, a11y, pending UI, and focus management'

export const meta: Route.MetaFunction = () => metaTags({ title, description })

const code = `import { z } from 'zod'
import { applySchema } from 'composable-functions'
import { formAction, SchemaForm } from 'remix-forms'

const schema = z.object({
  firstName: z.string().min(1),
  email: z.string().min(1).email(),
  howDidYouFindUs: z.enum(['aFriend', 'google']),
})

const mutation = applySchema(schema)(async (values) => values)

export const action = async ({ request }: Route.ActionArgs) =>
  formAction({
    request,
    schema,
    mutation,
    successPath: '/success',
  })

export default () => <SchemaForm schema={schema} />`

const schema = z.object({
  firstName: z.string().min(1),
  email: z.string().min(1).email(),
  howDidYouFindUs: z.enum(['aFriend', 'google']),
})

export const loader = () => ({
  code: hljs.highlight(code, { language: 'ts' }).value as string,
})

const mutation = applySchema(schema)(async (values) => values)

export const action = async ({ request }: Route.ActionArgs) =>
  formAction({
    request,
    schema,
    mutation,
    successPath: '/success',
  })

export default function Component({ loaderData }: Route.ComponentProps) {
  const { code } = loaderData

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8 sm:py-16">
      <div className="flex flex-col gap-8 sm:gap-16">
        <Heading className="text-center">
          The full-stack form library
          <br />
          for React Router v7
        </Heading>
        <div className="flex flex-col gap-6 xl:flex-row">
          <Code>{code}</Code>
          <div className="xl:flex-1">
            <h3 className="pb-6 text-center text-base-content/60 text-lg">
              This tiny code creates the form below 👇🏽
            </h3>
            <h2 className="pb-6 text-center text-base-content text-xl md:text-3xl">
              E2E{' '}
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
            <SchemaForm schema={schema}>
              {({ Field, Errors, Button }) => (
                <>
                  <Field name="firstName" />
                  <Field name="email" />
                  <Field name="howDidYouFindUs" />
                  <Errors />
                  <div className="flex items-center gap-4">
                    <h4 className="flex-1 text-center text-base-content/60">
                      (Go ahead, try it with JS disabled as well 😉)
                    </h4>
                    <Button />
                  </div>
                </>
              )}
            </SchemaForm>
          </div>
        </div>
        <div className="flex flex-col items-center gap-3">
          <p className="text-center text-base-content text-xl sm:text-2xl">
            Works with Zod, Yup, Valibot, ArkType, Effect Schema, and Joi
          </p>
          <p className="text-base-content/60 text-sm">
            Powered by{' '}
            <ExternalLink href="https://standardschema.dev">
              Standard Schema
            </ExternalLink>
          </p>
        </div>
        <dl className="grid auto-rows-min gap-8 md:grid-cols-2 xl:grid-cols-3">
          <Feature icon={FlaskConical} title="100% customizable UI">
            Customize everything without losing our accessible defaults.
          </Feature>
          <Feature icon={Scale} title="Single source of truth">
            Write your schema once and derive everything else from it.
          </Feature>
          <Feature icon={ShieldCheck} title="Bulletproof DX">
            End-to-end typed to your schema. Goodbye typos, hello autocomplete!
          </Feature>
          <Feature icon={Cloud} title="Server-side wiring">
            Perform secure server-side mutations with zero boilerplate.
          </Feature>
          <Feature icon={ClipboardCheck} title="Full-stack validation">
            Validate everything both on the client and the server.
          </Feature>
          <Feature icon={MousePointerClick} title="Focus management">
            Focus on the first field with error even for server-side failures.
          </Feature>
        </dl>
        <div className="flex justify-center">
          <Link to="/get-started" className="btn btn-primary">
            Get Started
          </Link>
        </div>
      </div>
    </div>
  )
}
