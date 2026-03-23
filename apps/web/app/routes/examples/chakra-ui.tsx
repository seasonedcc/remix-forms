import { applySchema } from 'composable-functions'
import hljs from 'highlight.js/lib/common'
import * as React from 'react'
import { formAction, makeSchemaForm } from 'remix-forms'
import { z } from 'zod'
import { cx, metaTags } from '~/helpers'
import Example from '~/ui/example'
import ExternalLink from '~/ui/external-link'
import type { Route } from './+types/chakra-ui'

const title = 'Chakra UI'
const description =
  'In this example, we show how makeSchemaForm enables type-safe integration with UI libraries like Chakra UI.'

export const meta: Route.MetaFunction = () => metaTags({ title, description })

const code = `import { makeSchemaForm } from 'remix-forms'
import {
  Button,
  FormErrorMessage,
  FormLabel,
  Input,
} from '@chakra-ui/react'

const SchemaForm = makeSchemaForm({
  input: Input,
  button: Button,
  label: FormLabel,
  error: FormErrorMessage,
})

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export default () => (
  <SchemaForm schema={schema}>
    {({ Field, Errors, Button }) => (
      <>
        <Field name="email">
          {({ Label, Input, Errors }) => (
            <>
              <Label>Email address</Label>
              {/* Type-safe! Input accepts Chakra's size and variant props */}
              <Input size="lg" variant="filled" />
              <Errors />
            </>
          )}
        </Field>
        <Field name="password" type="password">
          {({ Label, SmartInput, Errors }) => (
            <>
              <Label>Password</Label>
              <SmartInput />
              <Errors />
            </>
          )}
        </Field>
        <Errors />
        {/* Type-safe! Button accepts Chakra's colorScheme prop */}
        <Button colorScheme="blue" size="lg">
          Sign up
        </Button>
      </>
    )}
  </SchemaForm>
)`

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export const loader = () => ({
  code: hljs.highlight(code, { language: 'tsx' }).value,
})

const mutation = applySchema(schema)(async (values) => values)

export const action = async ({ request }: Route.ActionArgs) =>
  formAction({ request, schema, mutation })

type ChakraSize = 'xs' | 'sm' | 'md' | 'lg'
type ChakraVariant = 'outline' | 'filled' | 'flushed' | 'unstyled'
type ChakraColorScheme = 'blue' | 'green' | 'red' | 'orange' | 'purple' | 'teal'

type ChakraInputProps = Omit<JSX.IntrinsicElements['input'], 'size'> & {
  size?: ChakraSize
  variant?: ChakraVariant
}

type ChakraButtonProps = Omit<
  JSX.IntrinsicElements['button'],
  'size' | 'color'
> & {
  size?: ChakraSize
  colorScheme?: ChakraColorScheme
}

type ChakraLabelProps = JSX.IntrinsicElements['label'] & {
  fontSize?: ChakraSize
}

const sizeClasses: Record<ChakraSize, string> = {
  xs: 'input-xs',
  sm: 'input-sm',
  md: '',
  lg: 'input-lg',
}

const buttonSizeClasses: Record<ChakraSize, string> = {
  xs: 'btn-xs',
  sm: 'btn-sm',
  md: '',
  lg: 'btn-lg',
}

const colorSchemeClasses: Record<ChakraColorScheme, string> = {
  blue: 'btn-primary',
  green: 'btn-success',
  red: 'btn-error',
  orange: 'btn-warning',
  purple: 'btn-secondary',
  teal: 'btn-accent',
}

const ChakraInput = React.forwardRef<HTMLInputElement, ChakraInputProps>(
  (
    { size = 'md', variant = 'outline', type = 'text', className, ...props },
    ref
  ) => (
    <input
      ref={ref}
      type={type}
      className={cx(
        'input input-bordered w-full',
        sizeClasses[size],
        variant === 'filled' && 'bg-base-200',
        variant === 'flushed' && 'rounded-none border-x-0 border-t-0',
        className
      )}
      {...props}
    />
  )
)

const ChakraButton = React.forwardRef<HTMLButtonElement, ChakraButtonProps>(
  ({ size = 'md', colorScheme = 'blue', className, ...props }, ref) => (
    <div className="flex justify-end">
      <button
        ref={ref}
        className={cx(
          'btn',
          buttonSizeClasses[size],
          colorSchemeClasses[colorScheme],
          className
        )}
        {...props}
      />
    </div>
  )
)

const ChakraLabel = ({
  fontSize: _fontSize,
  className,
  ...props
}: ChakraLabelProps) => (
  // biome-ignore lint/a11y/noLabelWithoutControl: wrapper component
  <label className={cx('label', className)} {...props} />
)

const ChakraError = (props: JSX.IntrinsicElements['div']) => (
  <div className="text-error text-sm" {...props} />
)

const SchemaForm = makeSchemaForm({
  input: ChakraInput,
  button: ChakraButton,
  label: ChakraLabel,
  error: ChakraError,
})

export default function Component() {
  return (
    <Example
      title={title}
      description={
        <>
          In this example, we show how <em>makeSchemaForm</em> enables type-safe
          integration with UI libraries like{' '}
          <ExternalLink href="https://chakra-ui.com/">Chakra UI</ExternalLink>.
          Custom props like <em>size</em>, <em>variant</em>, and{' '}
          <em>colorScheme</em> flow through to Field children automatically.
        </>
      }
    >
      <SchemaForm
        schema={schema}
        inputTypes={{ password: 'password' }}
        buttonLabel="Sign up"
      >
        {({ Field, Errors, Button }) => (
          <>
            <Field name="email">
              {({ Label, Input, Errors }) => (
                <>
                  <Label>Email address</Label>
                  <Input size="lg" variant="filled" />
                  <Errors />
                </>
              )}
            </Field>
            <Field name="password" type="password">
              {({ Label, SmartInput, Errors }) => (
                <>
                  <Label>Password</Label>
                  <SmartInput />
                  <Errors />
                </>
              )}
            </Field>
            <Errors />
            <Button colorScheme="blue" size="lg">
              Sign up
            </Button>
          </>
        )}
      </SchemaForm>
    </Example>
  )
}
