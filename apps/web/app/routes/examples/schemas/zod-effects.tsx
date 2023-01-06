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

const title = 'Zod Effects'
const description =
  'In this example, we use Zod refine and superRefine to make our schemas more powerful.'

export const meta: MetaFunction = () => metaTags({ title, description })

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

const mutation = makeDomainFunction(schema)(async (values) => values)

export const action: ActionFunction = async ({ request }) =>
  formAction({ request, schema, mutation })

export default () => <Form schema={schema} />`

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

export const loader: LoaderFunction = () => ({
  code: hljs.highlight(code, { language: 'ts' }).value,
})

const mutation = makeDomainFunction(schema)(async (values) => values)

export const action: ActionFunction = async ({ request }) =>
  formAction({ request, schema, mutation })

export default function Component() {
  return (
    <Example title={title} description={description}>
      <Form schema={schema} />
    </Example>
  )
}
