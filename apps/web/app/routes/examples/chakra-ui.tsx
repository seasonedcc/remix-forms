import { applySchema } from 'composable-functions'
import hljs from 'highlight.js/lib/common'
import * as React from 'react'
import { Form } from 'react-router'
import { formAction, makeSchemaForm } from 'remix-forms'
import { z } from 'zod'
import { cx, metaTags } from '~/helpers'
import Checkbox from '~/ui/checkbox'
import CheckboxLabel from '~/ui/checkbox-label'
import Error from '~/ui/error'
import Errors from '~/ui/errors'
import Example from '~/ui/example'
import ExternalLink from '~/ui/external-link'
import Field from '~/ui/field'
import Fields from '~/ui/fields'
import Label from '~/ui/label'
import Radio from '~/ui/radio'
import RadioGroup from '~/ui/radio-group'
import RadioLabel from '~/ui/radio-label'
import Select from '~/ui/select'
import type { Route } from './+types/chakra-ui'

const title = 'Chakra UI'
const description =
  'In this example, we show how makeSchemaForm enables type-safe integration with UI libraries like Chakra UI.'

export const meta: Route.MetaFunction = () => metaTags({ title, description })

const code = `import { makeSchemaForm } from 'remix-forms'

const SchemaForm = makeSchemaForm({
  input: ChakraInput,
  multiline: ChakraTextarea,
  button: ChakraButton,
})

const schema = z.object({
  firstName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  bio: z.string().optional(),
  role: z.enum(['developer', 'designer', 'manager']),
})

export default () => (
  <SchemaForm schema={schema} multiline={['bio']} radio={['role']}>
    {({ Field, Errors, Button }) => (
      <>
        <Field name="firstName">
          {({ Label, SmartInput, Errors }) => (
            <>
              <Label>First name</Label>
              {/* SmartInput knows this is an input field — accepts ChakraInput props */}
              <SmartInput size="lg" />
              <Errors />
            </>
          )}
        </Field>
        <Field name="email">
          {({ Label, SmartInput, Errors }) => (
            <>
              <Label>Email address</Label>
              {/* SmartInput infers input slot — variant is a ChakraInput prop */}
              <SmartInput variant="filled" />
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
        <Field name="bio">
          {({ Label, SmartInput, Errors }) => (
            <>
              <Label>Bio</Label>
              {/* SmartInput knows bio is multiline — accepts ChakraTextarea props */}
              <SmartInput resize="none" />
              <Errors />
            </>
          )}
        </Field>
        <Field name="role">
          {({ Label, SmartInput, RadioGroup, Errors }) => (
            <>
              <Label>Role</Label>
              <RadioGroup>
                {/* SmartInput knows role is radio (enum in radio config) */}
                <SmartInput />
              </RadioGroup>
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
)`

const schema = z.object({
  firstName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  bio: z.string().optional(),
  role: z.enum(['developer', 'designer', 'manager']),
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
type ChakraResize = 'none' | 'vertical' | 'horizontal' | 'both'

type ChakraInputProps = Omit<JSX.IntrinsicElements['input'], 'size'> & {
  size?: ChakraSize
  variant?: ChakraVariant
}

type ChakraTextareaProps = Omit<JSX.IntrinsicElements['textarea'], 'size'> & {
  size?: ChakraSize
  resize?: ChakraResize
}

type ChakraButtonProps = Omit<
  JSX.IntrinsicElements['button'],
  'size' | 'color'
> & {
  size?: ChakraSize
  colorScheme?: ChakraColorScheme
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

const resizeClasses: Record<ChakraResize, string> = {
  none: 'resize-none',
  vertical: 'resize-y',
  horizontal: 'resize-x',
  both: 'resize',
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

const ChakraTextarea = React.forwardRef<
  HTMLTextAreaElement,
  ChakraTextareaProps
>(({ size = 'md', resize = 'vertical', className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cx(
      'textarea textarea-bordered w-full',
      sizeClasses[size],
      resizeClasses[resize],
      className
    )}
    {...props}
  />
))

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

const StyledForm = React.forwardRef<
  HTMLFormElement,
  React.ComponentPropsWithRef<typeof Form>
>((props, ref) => <Form ref={ref} className="flex flex-col gap-6" {...props} />)

const SchemaForm = makeSchemaForm({
  form: StyledForm,
  fields: Fields,
  field: Field,
  label: Label,
  input: ChakraInput,
  multiline: ChakraTextarea,
  select: Select,
  radio: Radio,
  radioGroup: RadioGroup,
  radioLabel: RadioLabel,
  checkbox: Checkbox,
  checkboxLabel: CheckboxLabel,
  button: ChakraButton,
  globalErrors: Errors,
  error: Error,
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
          SmartInput automatically infers which component it will render from
          the schema and form config, giving you the exact props of that
          component.
        </>
      }
    >
      <SchemaForm
        schema={schema}
        multiline={['bio']}
        radio={['role']}
        inputTypes={{ password: 'password' }}
        buttonLabel="Sign up"
      >
        {({ Field, Errors, Button }) => (
          <>
            <Field name="firstName">
              {({ Label, SmartInput, Errors }) => (
                <>
                  <Label>First name</Label>
                  <SmartInput size="lg" />
                  <Errors />
                </>
              )}
            </Field>
            <Field name="email">
              {({ Label, SmartInput, Errors }) => (
                <>
                  <Label>Email address</Label>
                  <SmartInput variant="filled" />
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
            <Field name="bio">
              {({ Label, SmartInput, Errors }) => (
                <>
                  <Label>Bio</Label>
                  <SmartInput resize="none" />
                  <Errors />
                </>
              )}
            </Field>
            <Field name="role">
              {({ Label, SmartInput, RadioGroup, Errors }) => (
                <>
                  <Label>Role</Label>
                  <RadioGroup>
                    <SmartInput />
                  </RadioGroup>
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
