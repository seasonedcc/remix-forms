import hljs from 'highlight.js/lib/common'
import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from '@remix-run/node'
import { formAction } from '@remix-forms/remix'
import { z } from 'zod'
import Form from '~/ui/form'
import { metaTags } from '~/helpers'
import { makeDomainFunction } from 'domain-functions'
import Example from '~/ui/example'

const title = 'Transform values'
const description =
  'In this example, we use different schemas for the form and the mutation, transforming the form values before calling the mutation.'

export const meta: MetaFunction = () => metaTags({ title, description })

const code = `const formSchema = z.object({
  firstName: z.string().min(1),
  email: z.string().min(1).email(),
})

const mutationSchema = formSchema.extend({
  country: z.enum(['BR', 'US']),
})

const mutation = makeDomainFunction(mutationSchema)(async (values) => values)

export const action: ActionFunction = async ({ request }) =>
  formAction({
    request,
    schema: formSchema,
    mutation,
    transformValues: (values) => ({ ...values, country: 'US' }),
  })

export default () => <Form schema={schema} />`

const formSchema = z.object({
  firstName: z.string().min(1),
  email: z.string().min(1).email(),
})

const mutationSchema = formSchema.extend({
  country: z.enum(['BR', 'US']),
})

export const loader: LoaderFunction = () => ({
  code: hljs.highlight(code, { language: 'ts' }).value,
})

const mutation = makeDomainFunction(mutationSchema)(async (values) => values)

export const action: ActionFunction = async ({ request }) =>
  formAction({
    request,
    schema: formSchema,
    mutation,
    transformValues: (values) => ({ ...values, country: 'US' }),
  })

export default function Component() {
  return (
    <Example title={title} description={description}>
      <Form schema={formSchema} />
    </Example>
  )
}
