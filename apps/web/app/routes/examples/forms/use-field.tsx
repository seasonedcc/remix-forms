import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from '@remix-run/node'
import { makeDomainFunction } from 'domain-functions'
import hljs from 'highlight.js/lib/common'
import * as React from 'react'
import { useField } from 'remix-forms'
import { z } from 'zod'
import { formAction } from '@remix-forms/remix'
import { cx, metaTags } from '~/helpers'
import Example from '~/ui/example'
import Form from '~/ui/form'

const title = 'useField'
const description = `In this example, we use the useField hook to display error, dirty and required indicators in custom components.`

export const meta: MetaFunction = () => metaTags({ title, description })

const code = `const schema = z.object({
  email: z.string().email(),
})

const Input = React.forwardRef<
  HTMLInputElement,
  JSX.IntrinsicElements['input']
>(({ type = 'text', ...props }, ref) => {
  const { errors } = useField()
  return (
    <input
      ref={ref}
      type={type}
      className={errors
          ? 'border-red-600 focus:border-red-600 focus:ring-red-600'
          : 'border-gray-300 focus:border-pink-500 focus:ring-pink-500',
      }
      {...props}
    />
  )
})

export default () => (
  <Form schema={schema} inputComponent={Input} />
)`

const schema = z.object({
  email: z.string().email(),
})

export const loader: LoaderFunction = () => ({
  code: hljs.highlight(code, { language: 'ts' }).value,
})

const mutation = makeDomainFunction(schema)(async (values) => values)

export const action: ActionFunction = async ({ request }) =>
  formAction({ request, schema, mutation })

const Input = React.forwardRef<
  HTMLInputElement,
  JSX.IntrinsicElements['input']
>(({ type = 'text', ...props }, ref) => {
  const { errors } = useField()
  return (
    <input
      ref={ref}
      type={type}
      className={cx(
        'block w-full rounded-md text-gray-800 shadow-sm sm:text-sm',
        errors
          ? 'border-red-600 focus:border-red-600 focus:ring-red-600'
          : 'border-gray-300 focus:border-pink-500 focus:ring-pink-500',
      )}
      {...props}
    />
  )
})

export default () => (
  <Example title={title} description={description}>
    <Form schema={schema} inputComponent={Input} />
  </Example>
)
