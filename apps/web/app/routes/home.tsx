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
import { cx, metaTags } from '~/helpers'
import Code from '~/ui/code'
import ExternalLink from '~/ui/external-link'
import { SchemaForm } from '~/ui/schema-form'
import type { Route } from './+types/home'

const title = 'Full-stack forms for React Router'
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

const iconGradients = [
  'from-primary/20',
  'from-secondary/20',
  'from-accent/20',
] as const

const features = [
  {
    icon: FlaskConical,
    title: '100% customizable UI',
    desc: 'Customize everything without losing our accessible defaults.',
  },
  {
    icon: Scale,
    title: 'Single source of truth',
    desc: 'Write your schema once and derive everything else from it.',
  },
  {
    icon: ShieldCheck,
    title: 'Bulletproof DX',
    desc: 'End-to-end typed to your schema. Goodbye typos, hello autocomplete!',
  },
  {
    icon: Cloud,
    title: 'Server-side wiring',
    desc: 'Perform secure server-side mutations with zero boilerplate.',
  },
  {
    icon: ClipboardCheck,
    title: 'Full-stack validation',
    desc: 'Validate everything both on the client and the server.',
  },
  {
    icon: MousePointerClick,
    title: 'Focus management',
    desc: 'Focus on the first field with error even for server-side failures.',
  },
]

type GlassCardProps = {
  children: React.ReactNode
  className?: string
}

function GlassCard({ children, className }: GlassCardProps) {
  return (
    <div
      className={cx(
        'rounded-2xl border border-white/10 bg-white/5 p-6',
        className
      )}
    >
      {children}
    </div>
  )
}

export default function Component({ loaderData }: Route.ComponentProps) {
  const { code } = loaderData

  return (
    <>
      <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden sm:min-h-[80vh]">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 20% 50%, rgba(167,139,250,0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 50%, rgba(34,211,238,0.15) 0%, transparent 50%), radial-gradient(ellipse at 50% 100%, rgba(244,114,182,0.1) 0%, transparent 50%)',
          }}
        />
        <div className="relative mx-auto max-w-5xl px-4 text-center">
          <h1 className="mb-6 font-bold font-display text-4xl leading-none tracking-tighter sm:text-5xl md:text-8xl">
            <span className="bg-linear-to-r from-[#c0392b] via-[#ff7979] to-[#e74c3c] bg-clip-text text-transparent">
              Full-stack forms
            </span>
            <br />
            <span className="text-base-content">for React Router</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-base-content/60 text-lg sm:text-xl">
            E2E type-safe, with client + server validations, a11y, pending UI,
            and focus management
          </p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              to="/get-started"
              className="btn btn-lg border-0 bg-linear-to-r from-[#c0392b] via-[#e04848] to-[#e74c3c] text-primary-content shadow-lg shadow-primary/25 transition-shadow hover:shadow-primary/30 hover:shadow-xl"
            >
              Get started
            </Link>
            <Link
              to="/examples"
              className="btn btn-outline btn-lg border-white/20"
            >
              Examples
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-8 sm:py-24">
        <div className="flex flex-col gap-8 xl:flex-row">
          <div className="xl:flex-1">
            <Code>{code}</Code>
          </div>
          <div className="xl:flex-1">
            <GlassCard className="backdrop-blur-md">
              <h3 className="pb-6 text-center text-base-content/50">
                This tiny code creates the form below 👇🏽
              </h3>
              <SchemaForm schema={schema}>
                {({ Field, Errors, Button }) => (
                  <>
                    <Field name="firstName" />
                    <Field name="email" />
                    <Field name="howDidYouFindUs" />
                    <Errors />
                    <div className="flex items-center gap-4">
                      <p className="flex-1 text-center text-base-content/40 text-sm">
                        (Go ahead, try it with JS disabled as well 😉)
                      </p>
                      <Button />
                    </div>
                  </>
                )}
              </SchemaForm>
            </GlassCard>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pt-16 pb-8 sm:px-8">
        <h2 className="mb-4 text-center font-bold font-display text-3xl tracking-tighter sm:text-4xl">
          <span className="bg-linear-to-r from-[#c0392b] via-[#ff7979] to-[#e74c3c] bg-clip-text text-transparent">
            From schema to form
          </span>
        </h2>
        <p className="mb-12 text-center text-base-content/50">
          Works with Zod, Yup, Valibot, ArkType, Effect Schema, and Joi. Powered
          by{' '}
          <ExternalLink
            href="https://standardschema.dev"
            className="text-secondary"
          >
            Standard Schema
          </ExternalLink>
          .
        </p>
        <dl className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {features.map(({ icon: Icon, title, desc }, i) => (
            <GlassCard key={title}>
              <dt className="flex items-center gap-3">
                <div
                  className={cx(
                    'flex size-10 items-center justify-center rounded-xl bg-linear-to-br to-transparent',
                    iconGradients[i % iconGradients.length]
                  )}
                >
                  <Icon className="size-5 text-primary" aria-hidden="true" />
                </div>
                <span className="font-display font-semibold text-base-content tracking-tighter">
                  {title}
                </span>
              </dt>
              <dd className="mt-3 text-base-content/60 leading-relaxed">
                {desc}
              </dd>
            </GlassCard>
          ))}
        </dl>
      </section>

      <section className="flex justify-center px-4 pt-8 pb-16 sm:pt-12 sm:pb-24">
        <Link
          to="/get-started"
          className="btn btn-lg border-0 bg-linear-to-r from-[#c0392b] via-[#e04848] to-[#e74c3c] text-primary-content shadow-lg shadow-primary/25"
        >
          Start building
        </Link>
      </section>
    </>
  )
}
