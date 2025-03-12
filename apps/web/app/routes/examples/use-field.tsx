import { applySchema } from 'composable-functions'
import hljs from 'highlight.js/lib/common'
import * as React from 'react'
import { formAction, useField } from 'remix-forms'
import { z } from 'zod'
import { cx, metaTags } from '~/helpers'
import Example from '~/ui/example'
import { SchemaForm } from '~/ui/schema-form'
import type { Route } from './+types/use-field'

const title = 'useField'
const description =
  'In this example, we use the useField hook to display error, dirty and required indicators in custom components.'

export const meta: Route.MetaFunction = () => metaTags({ title, description })

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
  <SchemaForm schema={schema} inputComponent={Input} />
)`

const schema = z.object({
  email: z.string().email(),
})

export const loader = () => ({
  code: hljs.highlight(code, { language: 'ts' }).value,
})

const mutation = applySchema(schema)(async (values) => values)

export const action = async ({ request }: Route.ActionArgs) =>
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
          : 'border-gray-300 focus:border-pink-500 focus:ring-pink-500'
      )}
      {...props}
    />
  )
})

export default () => (
  <Example title={title} description={description}>
    <SchemaForm schema={schema} inputComponent={Input} />
  </Example>
)
