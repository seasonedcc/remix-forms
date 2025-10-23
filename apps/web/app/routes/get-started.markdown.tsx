import { Link } from 'react-router'
import { useState } from 'react'
import { metaTags } from '~/helpers'
import { getStartedPageToMarkdown } from '~/utils/page-to-markdown'
import type { Route } from './+types/get-started.markdown'

const title = 'Get Started - Markdown View'
const description = 'Getting Started guide in Markdown format'

export const meta: Route.MetaFunction = () => metaTags({ title, description })

const stylesCode = `import type { SchemaFormProps, FormSchema } from 'remix-forms'
import { SchemaForm as BaseForm } from 'remix-forms'

function SchemaForm<Schema extends FormSchema>(props: SchemaFormProps<Schema>) {
  return (
    <BaseForm<Schema>
      className={/* your form classes */}
      fieldComponent={/* your custom Field */}
      labelComponent={/* your custom Label */}
      inputComponent={/* your custom Input */}
      multilineComponent={/* your custom Multiline */}
      selectComponent={/* your custom Select */}
      checkboxComponent={/* your custom Checkbox */}
      checkboxWrapperComponent={/* your custom checkbox wrapper */}
      buttonComponent={/* your custom Button */}
      fieldErrorsComponent={/* your custom FieldErrors */}
      globalErrorsComponent={/* your custom GlobalErrors */}
      errorComponent={/* your custom Error */}
      {...props}
    />
  )
}

export { SchemaForm }
`

const schemaCode = `import { z } from 'zod'

const schema = z.object({
  firstName: z.string().min(1),
  email: z.string().min(1).email(),
})`

const mutationCode = `import { applySchema } from 'composable-functions'

const mutation = applySchema(schema)(async (values) => (
  console.log(values) /* or anything else, like saveMyValues(values) */
))`

const actionCode = `import { formAction } from 'remix-forms'

export const action = async ({ request }: Route.ActionArgs) =>
  formAction({
    request,
    schema,
    mutation,
    successPath: '/success', /* path to redirect on success */
  })`

const basicCode = `import { SchemaForm } from 'remix-forms'

export default () => <SchemaForm schema={schema} />`

const customFormCode = `<SchemaForm schema={schema}>
  {({ Field, Errors, Button }) => (
    <>
      <Field name="firstName" label="First name" />
      <Field name="email" label="E-mail" />
      <em>You'll hear from us at this address 👆🏽</em>
      <Errors />
      <Button />
    </>
  )}
</SchemaForm>`

const customFieldCode = `<SchemaForm schema={schema}>
  {({ Field, Errors, Button }) => (
    <>
      <Field name="firstName" label="First name" />
      <Field name="email">
        {({ Label, SmartInput, Errors }) => (
          <>
            <Label>E-mail</Label>
            <em>You'll hear from us at this address 👇🏽</em>
            <SmartInput />
            <Errors />
          </>
        )}
      </Field>
      <Errors />
      <Button />
    </>
  )}
</SchemaForm>`

const customInputCode = `<SchemaForm schema={schema}>
  {({ Field, Errors, Button, register }) => (
    <>
      <Field name="firstName" label="First name" />
      <Field name="email" label="E-mail">
        {({ Label, Errors }) => (
          <>
            <Label />
            <input {...register('email')} />
            <Errors />
          </>
        )}
      </Field>
      <Errors />
      <Button />
    </>
  )}
</SchemaForm>`

export const loader = () => {
  const markdownContent = getStartedPageToMarkdown({
    stylesCode,
    schemaCode,
    mutationCode,
    actionCode,
    basicCode,
    customFormCode,
    customFieldCode,
    customInputCode,
  })

  return { markdownContent }
}

export default function Component({ loaderData }: Route.ComponentProps) {
  const { markdownContent } = loaderData
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdownContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200">
      <div className="m-auto max-w-5xl px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/get-started"
            className="flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Get Started
          </Link>

          <button
            onClick={handleCopy}
            className="flex items-center gap-2 rounded-lg border-2 border-gray-200 bg-transparent px-4 py-2 text-sm font-medium text-white transition-colors hover:border-white hover:bg-gray-800 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        {/* Markdown Content */}
        <div className="overflow-auto rounded-lg border border-gray-700 bg-gray-800 p-6">
          <pre className="whitespace-pre-wrap font-mono text-sm text-gray-200">
            {markdownContent}
          </pre>
        </div>

        {/* Success Toast */}
        {copied && (
          <div className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 transform rounded-lg bg-green-600 px-6 py-3 text-white shadow-lg">
            <div className="flex items-center gap-2">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Copied to clipboard!
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
