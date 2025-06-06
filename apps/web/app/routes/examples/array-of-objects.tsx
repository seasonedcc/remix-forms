import { applySchema } from 'composable-functions'
import hljs from 'highlight.js/lib/common'
import { uniq } from 'lodash-es'
import { useRef } from 'react'
import { formAction } from 'remix-forms'
import { z } from 'zod'
import { metaTags } from '~/helpers'
import Example from '~/ui/example'
import { SchemaForm } from '~/ui/schema-form'
import type { Route } from './+types/array-of-objects'

const title = 'Array of objects'
const description =
  'In this example, we use custom inputs to manage an array of objects.'

export const meta: Route.MetaFunction = () => metaTags({ title, description })

const code = `const schema = z.object({
  title: z.string().min(1),
  contacts: z
    .array(z.object({ name: z.string().min(1), email: z.string().email() }))
    .min(1),
})

const mutation = applySchema(schema)(async (values) => values)

export const action = async ({ request }: Route.ActionArgs) =>
  formAction({ request, schema, mutation })

export default () => {
  const nameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)

  return (
    <SchemaForm schema={schema} values={{ contacts: [] }}>
      {({ Field, Errors, Button, watch, setValue }) => {
        const contacts = watch('contacts')

        return (
          <>
            <Field name="title" />
            <Field name="contacts">
              {({ Label, Errors }) => (
                <>
                  <Label />
                  <fieldset className="flex gap-2">
                    <input
                      type="text"
                      className="block w-full rounded-md border-gray-300 text-gray-800
                      shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm"
                      placeholder="Name"
                      ref={nameRef}
                    />
                    <input
                      type="text"
                      className="block w-full rounded-md border-gray-300 text-gray-800
                      shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm"
                      placeholder="E-mail"
                      ref={emailRef}
                    />
                    <button
                      className="rounded-md bg-pink-500 px-4"
                      onClick={(event) => {
                        event.preventDefault()

                        const name = nameRef.current?.value
                        const email = emailRef.current?.value

                        if (name && email) {
                          setValue(
                            'contacts',
                            uniq([...contacts, { name, email }]),
                            { shouldValidate: true },
                          )
                          nameRef.current.value = ''
                          emailRef.current.value = ''
                        }
                      }}
                    >
                      +
                    </button>
                  </fieldset>
                  {contacts && (
                    <section className="-ml-1 flex flex-wrap pt-1">
                      {contacts.map((contact, index) => (
                        <span key={contact.email}>
                          <span className="m-1 flex items-center rounded-md bg-pink-500 px-2 py-1 text-white">
                            <span className="flex-1">
                              {contact.name} ({contact.email})
                            </span>
                            <button
                              className="ml-2 text-pink-700"
                              onClick={() => {
                                setValue(
                                  'contacts',
                                  contacts.filter(
                                    ({ email }) => email !== contact.email,
                                  ),
                                  { shouldValidate: true },
                                )
                              }}
                            >
                              X
                            </button>
                          </span>
                          <input
                            type="hidden"
                            name={\`contacts[\${index}][name]\`}
                            value={contact.name}
                          />
                          <input
                            type="hidden"
                            name={\`contacts[\${index}][email]\`}
                            value={contact.email}
                          />
                        </span>
                      ))}
                    </section>
                  )}
                  <Errors />
                </>
              )}
            </Field>
            <Errors />
            <Button />
          </>
        )
      }}
    </SchemaForm>
  )
}`

const schema = z.object({
  title: z.string().min(1),
  contacts: z
    .array(z.object({ name: z.string().min(1), email: z.string().email() }))
    .min(1),
})

export const loader = () => ({
  code: hljs.highlight(code, { language: 'ts' }).value,
})

const mutation = applySchema(schema)(async (values) => values)

export const action = async ({ request }: Route.ActionArgs) =>
  formAction({ request, schema, mutation })

export default () => {
  const nameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)

  return (
    <Example title={title} description={description}>
      <SchemaForm schema={schema} values={{ contacts: [] }}>
        {({ Field, Errors, Button, watch, setValue }) => {
          const contacts = watch('contacts')

          return (
            <>
              <Field name="title" />
              <Field name="contacts">
                {({ Label, Errors }) => (
                  <>
                    <Label />
                    <fieldset className="flex gap-2">
                      <input
                        type="text"
                        className="block w-full rounded-md border-gray-300 text-gray-800 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm"
                        placeholder="Name"
                        ref={nameRef}
                      />
                      <input
                        type="text"
                        className="block w-full rounded-md border-gray-300 text-gray-800 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm"
                        placeholder="E-mail"
                        ref={emailRef}
                      />
                      <button
                        className="rounded-md bg-pink-500 px-4"
                        onClick={(event) => {
                          event.preventDefault()

                          const name = nameRef.current?.value
                          const email = emailRef.current?.value

                          if (name && email) {
                            setValue(
                              'contacts',
                              uniq([...contacts, { name, email }]),
                              { shouldValidate: true }
                            )
                            nameRef.current.value = ''
                            emailRef.current.value = ''
                          }
                        }}
                      >
                        +
                      </button>
                    </fieldset>
                    {contacts && (
                      <section className="-ml-1 flex flex-wrap pt-1">
                        {contacts.map((contact, index) => (
                          <span key={contact.email}>
                            <span className="m-1 flex items-center rounded-md bg-pink-500 px-2 py-1 text-white">
                              <span className="flex-1">
                                {contact.name} ({contact.email})
                              </span>
                              <button
                                className="ml-2 text-pink-700"
                                onClick={() => {
                                  setValue(
                                    'contacts',
                                    contacts.filter(
                                      ({ email }) => email !== contact.email
                                    ),
                                    { shouldValidate: true }
                                  )
                                }}
                              >
                                X
                              </button>
                            </span>
                            <input
                              type="hidden"
                              name={`contacts[${index}][name]`}
                              value={contact.name}
                            />
                            <input
                              type="hidden"
                              name={`contacts[${index}][email]`}
                              value={contact.email}
                            />
                          </span>
                        ))}
                      </section>
                    )}
                    <Errors />
                  </>
                )}
              </Field>
              <Errors />
              <Button />
            </>
          )
        }}
      </SchemaForm>
    </Example>
  )
}
