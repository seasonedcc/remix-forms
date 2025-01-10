import type { ActionFunctionArgs, MetaFunction } from '@remix-run/node'
import { applySchema } from 'composable-functions'
import { formAction, SchemaForm } from 'remix-forms'
import { z } from 'zod'

export const meta: MetaFunction = () => {
  return [
    { title: 'New Remix App' },
    { name: 'description', content: 'Welcome to Remix!' },
  ]
}

const schema = z.object({
  firstName: z.string().min(1),
  email: z.string().min(1).email(),
  howYouFoundOutAboutUs: z.enum(['fromAFriend', 'google']),
})

const mutation = applySchema(schema)(async (values) => values)

export const action = async ({ request }: ActionFunctionArgs) =>
  formAction({
    request,
    schema,
    mutation,
    successPath: '/success',
  })

export default function Component() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8 sm:py-16">
      <div className="flex flex-col space-y-8 sm:space-y-16">
        <h1 className="text-center">
          The full-stack form library
          <br />
          for Remix and React Router
        </h1>
        <div className="flex flex-col space-y-6 space-x-0 xl:flex-row xl:space-x-6 xl:space-y-0">
          <div className="xl:flex-1">
            <h3 className="pb-6 text-center text-lg text-gray-400">
              This tiny code creates the form below 👇🏽
            </h3>
            <h2 className="pb-6 text-center text-xl text-white md:text-3xl">
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
            <SchemaForm schema={schema} />
          </div>
        </div>
      </div>
    </div>
  )
}
