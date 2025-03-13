import { applySchema } from 'composable-functions'
import hljs from 'highlight.js/lib/common'
import { formAction } from 'remix-forms'
import { z } from 'zod'
import { metaTags } from '~/helpers'
import Example from '~/ui/example'
import { SchemaForm } from '~/ui/schema-form'
import type { Route } from './+types/multiple-forms'

const title = 'Multiple forms'
const description =
  'In this example, we show how you can handle multiple forms in the same route.'

export const meta: Route.MetaFunction = () => metaTags({ title, description })

const code = `const loginSchema = z.object({
  _action: z.literal('/login'),
  email: z.string().email(),
  password: z.string().min(8),
})
  
const contactSchema = z.object({
  _action: z.literal('/contact'),
  email: z.string().email(),
  message: z.string().min(1),
})

const loginMutation = applySchema(loginSchema)(
  async (values) => values
)

const contactMutation = applySchema(contactSchema)(
  async (values) => values
)

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.clone().formData()
  const action = formData.get('_action')

  if (action === '/login') {
    return formAction({
      request,
      mutation: loginMutation,
      schema: loginSchema,
    })
  }

  if (action === '/contact') {
    return formAction({
      request,
      mutation: contactMutation,
      schema: contactSchema,
    })
  }
}

export default () => {
  return (
    <>
      <SchemaForm
        schema={loginSchema}
        buttonLabel="Login"
        hiddenFields={['_action']}
        values={{ _action: '/login' }}
      />
      <SchemaForm
        schema={contactSchema}
        multiline={['message']}
        buttonLabel="Contact Us"
        hiddenFields={['_action']}
        values={{ _action: '/contact' }}
      />
    </>
  )
}`

const loginSchema = z.object({
  _action: z.literal('/login'),
  email: z.string().email(),
  password: z.string().min(8),
})

const contactSchema = z.object({
  _action: z.literal('/contact'),
  email: z.string().email(),
  message: z.string().min(1),
})

export const loader = () => ({
  code: hljs.highlight(code, { language: 'ts' }).value,
})

const loginMutation = applySchema(loginSchema)(async (values) => values)

const contactMutation = applySchema(contactSchema)(async (values) => values)

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.clone().formData()
  const action = formData.get('_action')

  if (action === '/login') {
    return formAction({
      request,
      mutation: loginMutation,
      schema: loginSchema,
    })
  }

  if (action === '/contact') {
    return formAction({
      request,
      mutation: contactMutation,
      schema: contactSchema,
    })
  }
}

export default function Component() {
  return (
    <Example title={title} description={description}>
      <SchemaForm
        schema={loginSchema}
        buttonLabel="Login"
        hiddenFields={['_action']}
        values={{ _action: '/login' }}
      />
      <SchemaForm
        schema={contactSchema}
        multiline={['message']}
        buttonLabel="Contact Us"
        hiddenFields={['_action']}
        values={{ _action: '/contact' }}
      />
    </Example>
  )
}
