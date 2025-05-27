import { applySchema } from 'composable-functions'
import hljs from 'highlight.js/lib/common'
import { formAction } from 'remix-forms'
import { z } from 'zod/v4'
import { metaTags } from '~/helpers'
import Example from '~/ui/example'
import { SchemaForm } from '~/ui/schema-form'
import type { Route } from './+types/zod-effects'

const title = 'Zod Effects'
const description =
  'In this example, we use Zod refine and superRefine to make our schemas more powerful.'

export const meta: Route.MetaFunction = () => metaTags({ title, description })

const code = `const schema = z
  .object({
    planType: z.enum(['personal', 'corporate']),
    quantity: z.number().min(0),
  })
  .refine(
    ({ planType, quantity }) => !(planType === 'personal' && quantity >= 8),
    {
      message: 'For 8 cards or more please use our corporate plan',
      path: ['planType'],
    },
  )
  .superRefine((arg, ctx) => {
    const isCorporate = arg.planType === 'corporate'

    if (isCorporate && arg.quantity < 8) {
      ctx.addIssue({
        code: z.ZodIssueCode.too_small,
        minimum: 8,
        message: 'For corporate cards you must issue at least 8',
        type: 'number',
        inclusive: true,
        fatal: true,
        path: ['planType'],
      })
    }
  })

const mutation = applySchema(schema)(async (values) => values)

export const action = async ({ request }: Route.ActionArgs) =>
  formAction({ request, schema, mutation })

export default () => <SchemaForm schema={schema} />`

const schema = z
  .object({
    planType: z.enum(['personal', 'corporate']),
    quantity: z.number().min(0),
  })
  .refine(
    ({ planType, quantity }) => !(planType === 'personal' && quantity >= 8),
    {
      message: 'For 8 cards or more please use our corporate plan',
      path: ['planType'],
    }
  )
  .superRefine((arg, ctx) => {
    const isCorporate = arg.planType === 'corporate'

    if (isCorporate && arg.quantity < 8) {
      ctx.addIssue({
        code: z.ZodIssueCode.too_small,
        minimum: 8,
        message: 'For corporate cards you must issue at least 8',
        type: 'number',
        inclusive: true,
        fatal: true,
        path: ['planType'],
      })
    }
  })

export const loader = () => ({
  code: hljs.highlight(code, { language: 'ts' }).value,
})

const mutation = applySchema(schema)(async (values) => values)

export const action = async ({ request }: Route.ActionArgs) =>
  formAction({ request, schema, mutation })

export default function Component() {
  return (
    <Example title={title} description={description}>
      <SchemaForm schema={schema} />
    </Example>
  )
}
