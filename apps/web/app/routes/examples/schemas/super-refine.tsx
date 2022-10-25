import hljs from 'highlight.js/lib/common'
import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from '@remix-run/node'
import { formAction } from 'remix-forms'
import { z } from 'zod'
import Form from '~/ui/form'
import { metaTags } from '~/helpers'
import { makeDomainFunction } from 'domain-functions'
import Example from '~/ui/example'

const title = 'superRefine'
const description =
  'In this example, we can use custom validations when the type system is not enough to validate input.'

export const meta: MetaFunction = () => metaTags({ title, description })

const code = `const schema =  z
.object({
  planType: z.enum(["personal", "corporate"]),
  quantity: z.number().min(0),
})
.superRefine((arg, ctx) => {
  const isCorporate = arg.planType === "corporate";

  if (isCorporate && arg.quantity < 8) {
    ctx.addIssue({
      code: z.ZodIssueCode.too_small,
      minimum: 8,
      message: "For corporate cards you must issue at least 8",
      type: "number",
      inclusive: true,
      fatal: true,
      path: ["planType"],
    });
  }
});

const mutation = makeDomainFunction(schema)(async (values) => values)

export const action: ActionFunction = async ({ request }) =>
  formAction({ request, schema, mutation })

export default () => <Form schema={schema} />`

const schema = z
  .object({
    planType: z.enum(['personal', 'corporate']),
    quantity: z.number().min(0),
  })
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
