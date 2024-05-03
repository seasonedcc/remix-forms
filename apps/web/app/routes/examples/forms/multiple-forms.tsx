import hljs from 'highlight.js/lib/common'
import type { ActionFunction, LoaderFunction } from '@remix-run/node'
import { formAction } from '~/formAction'
import { z } from 'zod'
import Form from '~/ui/form'
import { metaTags } from '~/helpers'
import { makeDomainFunction } from 'domain-functions'
import Example from '~/ui/example'

const title = 'Multiple forms'
const description =
  'In this example, we show how you can handle multiple forms in the same route.'

export const meta = () => metaTags({ title, description })

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

const loginMutation = makeDomainFunction(loginSchema)(
  async (values) => values
)

const contactMutation = makeDomainFunction(contactSchema)(
  async (values) => values
)

export const action: ActionFunction = async ({ request }) => {
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
      <Form
        schema={loginSchema}
        buttonLabel="Login"
        hiddenFields={['_action']}
        values={{ _action: '/login' }}
      />
      <Form
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

export const loader: LoaderFunction = () => ({
  code: hljs.highlight(code, { language: 'ts' }).value,
})

const loginMutation = makeDomainFunction(loginSchema)(async (values) => values)

const contactMutation = makeDomainFunction(contactSchema)(
  async (values) => values,
)

export const action: ActionFunction = async ({ request }) => {
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
      <Form
        schema={loginSchema}
        buttonLabel="Login"
        hiddenFields={['_action']}
        values={{ _action: '/login' }}
      />
      <Form
        schema={contactSchema}
        multiline={['message']}
        buttonLabel="Contact Us"
        hiddenFields={['_action']}
        values={{ _action: '/contact' }}
      />
    </Example>
  )
}
