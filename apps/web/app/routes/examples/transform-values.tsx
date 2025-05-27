import { applySchema } from 'composable-functions'
import hljs from 'highlight.js/lib/common'
import { formAction } from 'remix-forms'
import { z } from 'zod/v4'
import { metaTags } from '~/helpers'
import Example from '~/ui/example'
import { SchemaForm } from '~/ui/schema-form'
import type { Route } from './+types/transform-values'

const title = 'Transform values'
const description =
  'In this example, we use different schemas for the form and the mutation, transforming the form values before calling the mutation.'

export const meta: Route.MetaFunction = () => metaTags({ title, description })

const code = `const formSchema = z.object({
  firstName: z.string().min(1),
  email: z.string().min(1).email(),
})

const mutationSchema = formSchema.extend({
  country: z.enum(['BR', 'US']),
})

const mutation = applySchema(mutationSchema)(async (values) => values)

export const action = async ({ request }: Route.ActionArgs) =>
  formAction({
    request,
    schema: formSchema,
    mutation,
    transformValues: (values) => ({ ...values, country: 'US' }),
  })

export default () => <SchemaForm schema={schema} />`

const formSchema = z.object({
  firstName: z.string().min(1),
  email: z.string().min(1).email(),
})

const mutationSchema = formSchema.extend({
  country: z.enum(['BR', 'US']),
})

export const loader = () => ({
  code: hljs.highlight(code, { language: 'ts' }).value,
})

const mutation = applySchema(mutationSchema)(async (values) => values)

export const action = async ({ request }: Route.ActionArgs) =>
  formAction({
    request,
    schema: formSchema,
    mutation,
    transformValues: (values) => ({ ...values, country: 'US' }),
  })

export default function Component() {
  return (
    <Example title={title} description={description}>
      <SchemaForm schema={formSchema} />
    </Example>
  )
}
