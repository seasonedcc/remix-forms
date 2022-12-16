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
import { formAction } from '~/formAction'
import { cx, metaTags } from '~/helpers'
import Example from '~/ui/example'
import Form from '~/ui/form'

const title = 'useField'
const description = `In this example, we use the useField hook to display error, dirty and required indicators in custom components.`

export const meta: MetaFunction = () => metaTags({ title, description })

const code = `const schema = z.object({
  email: z.string().email(),
  firstName: z.string().optional(),
  preferredSport: z.enum(['Basketball', 'Football', 'Other']),
  newsletter: z.boolean().default(false),
})

const Label = ({ children, ...props }: JSX.IntrinsicElements['label']) => {
  const { required, errors, dirty } = useField()
  return (
    <label
      className={errors ? 'text-red-600' : dirty ? 'text-yellow-600' : 'text-gray-400'}
      {...props}
    >
      {children}
      {required && <sup>*</sup>}
    </label>
  )
}
const Input = React.forwardRef<
  HTMLInputElement,
  JSX.IntrinsicElements['input']
>(({ type = 'text', ...props }, ref) => {
  const { errors, dirty } = useField()
  return (
    <input
      ref={ref}
      type={type}
      className={errors
          ? 'border-red-600 focus:border-red-600 focus:ring-red-600'
          : dirty
          ? 'border-yellow-600 focus:border-yellow-600 focus:ring-yellow-600'
          : 'border-gray-300 focus:border-pink-500 focus:ring-pink-500',
      }
      {...props}
    />
  )
})

// Select component similar to Input

export default () => (
  <Form
    schema={schema}
    values={{ email: 'default@domain.tld', preferredSport: 'Basketball' }}
    labelComponent={Label}
    inputComponent={Input}
    selectComponent={Select}
  />
)`

const schema = z.object({
  email: z.string().email(),
  firstName: z.string().optional(),
  preferredSport: z.enum(['Basketball', 'Football', 'Other']),
  newsletter: z.boolean().default(false),
})

export const loader: LoaderFunction = () => ({
  code: hljs.highlight(code, { language: 'ts' }).value,
})

const mutation = makeDomainFunction(schema)(async (values) => values)

export const action: ActionFunction = async ({ request }) =>
  formAction({ request, schema, mutation })

const Label = ({ children, ...props }: JSX.IntrinsicElements['label']) => {
  const { required, errors, dirty } = useField()
  return (
    <label
      className={cx(
        'block font-medium',
        errors ? 'text-red-600' : dirty ? 'text-yellow-600' : 'text-gray-400',
      )}
      {...props}
    >
      {children}
      {required && <sup>*</sup>}
    </label>
  )
}
const Input = React.forwardRef<
  HTMLInputElement,
  JSX.IntrinsicElements['input']
>(({ type = 'text', ...props }, ref) => {
  const { errors, dirty } = useField()
  return (
    <input
      ref={ref}
      type={type}
      className={cx(
        'block w-full rounded-md text-gray-800 shadow-sm sm:text-sm',
        errors
          ? 'border-red-600 focus:border-red-600 focus:ring-red-600'
          : dirty
          ? 'border-yellow-600 focus:border-yellow-600 focus:ring-yellow-600'
          : 'border-gray-300 focus:border-pink-500 focus:ring-pink-500',
      )}
      {...props}
    />
  )
})

const Select = React.forwardRef<
  HTMLSelectElement,
  JSX.IntrinsicElements['select']
>((props, ref) => {
  const { errors, dirty } = useField()
  return (
    <select
      ref={ref}
      className={cx(
        'block w-full rounded-md py-2 pl-3 pr-10 text-base text-gray-800 focus:outline-none sm:text-sm',
        errors
          ? 'border-red-600 focus:border-red-600 focus:ring-red-600'
          : dirty
          ? 'border-yellow-600 focus:border-yellow-600 focus:ring-yellow-600'
          : 'border-gray-300 focus:border-pink-500 focus:ring-pink-500',
      )}
      {...props}
    />
  )
})

const Checkbox = React.forwardRef<
  HTMLInputElement,
  JSX.IntrinsicElements['input']
>(({ type = 'checkbox', className, ...props }, ref) => {
  const { errors, dirty } = useField()
  return (
    <input
      ref={ref}
      type={type}
      className={cx(
        'h-4 w-4 rounded',
        errors
          ? 'border-red-600 focus:border-red-600 focus:ring-red-600'
          : dirty
          ? 'border-yellow-600 focus:border-yellow-600 focus:ring-yellow-600'
          : 'border-gray-300 focus:border-pink-500 focus:ring-pink-500',
      )}
      {...props}
    />
  )
})

export default () => (
  <Example title={title} description={description}>
    <Form
      schema={schema}
      values={{
        email: 'default@domain.tld',
        preferredSport: 'Basketball',
      }}
      labelComponent={Label}
      inputComponent={Input}
      selectComponent={Select}
      checkboxComponent={Checkbox}
    />
  </Example>
)
