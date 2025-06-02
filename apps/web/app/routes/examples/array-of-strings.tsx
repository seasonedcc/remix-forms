import { applySchema } from 'composable-functions'
import hljs from 'highlight.js/lib/common'
import { uniq } from 'lodash-es'
import { useRef } from 'react'
import { formAction } from 'remix-forms'
import { z } from 'zod'
import { metaTags } from '~/helpers'
import Example from '~/ui/example'
import { SchemaForm } from '~/ui/schema-form'
import type { Route } from './+types/array-of-strings'

const title = 'Array of strings'
const description =
  'In this example, we use custom inputs to manage an array of string tags.'

export const meta: Route.MetaFunction = () => metaTags({ title, description })

const code = `const schema = z.object({
  title: z.string().min(1),
  tags: z.array(z.string()).min(1),
})

const mutation = applySchema(schema)(async (values) => values)

export const action = async ({ request }: Route.ActionArgs) =>
  formAction({ request, schema, mutation })

export default () => {
  const tagRef = useRef<HTMLInputElement>(null)

  return (
    <SchemaForm schema={schema} values={{ tags: [] }}>
      {({ Field, Errors, Button, watch, setValue }) => {
        const tags = watch('tags')

        return (
          <>
            <Field name="title" />
            <Field name="tags">
              {({ Label, Errors }) => (
                <>
                  <Label />
                  <input
                    type="text"
                    className="block w-full rounded-md border-gray-300 text-gray-800 shadow-sm
                    focus:border-pink-500 focus:ring-pink-500 sm:text-sm"
                    placeholder="Add a tag and press Enter..."
                    ref={tagRef}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault()

                        if (tagRef.current) {
                          const value = tagRef.current.value
                          if (value) {
                            setValue(
                              'tags',
                              uniq([...(tags || []), value.toLowerCase()]),
                              { shouldValidate: true },
                            )
                          }
                          tagRef.current.value = ''
                        }
                      }
                    }}
                  />
                  {tags && (
                    <section className="-ml-1 flex flex-wrap pt-1">
                      {tags.map((tag) => (
                        <span key={tag}>
                          <span className="m-1 flex items-center rounded-md bg-pink-500 px-2 py-1 text-white">
                            <span className="flex-1">{tag}</span>
                            <button
                              className="ml-2 text-pink-700"
                              onClick={() => {
                                setValue(
                                  'tags',
                                  tags.filter((value) => tag !== value),
                                  { shouldValidate: true },
                                )
                              }}
                            >
                              X
                            </button>
                          </span>
                          <input type="hidden" name="tags[]" value={tag} />
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
  tags: z.array(z.string()).min(1),
})

export const loader = () => ({
  code: hljs.highlight(code, { language: 'ts' }).value,
})

const mutation = applySchema(schema)(async (values) => values)

export const action = async ({ request }: Route.ActionArgs) =>
  formAction({ request, schema, mutation })

export default () => {
  const tagRef = useRef<HTMLInputElement>(null)

  return (
    <Example title={title} description={description}>
      <SchemaForm schema={schema} values={{ tags: [] }}>
        {({ Field, Errors, Button, watch, setValue }) => {
          const tags = watch('tags')

          return (
            <>
              <Field name="title" />
              <Field name="tags">
                {({ Label, Errors }) => (
                  <>
                    <Label />
                    <input
                      type="text"
                      className="block w-full rounded-md border-gray-300 text-gray-800 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm"
                      placeholder="Add a tag and press Enter..."
                      ref={tagRef}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault()

                          if (tagRef.current) {
                            const value = tagRef.current.value
                            if (value) {
                              setValue(
                                'tags',
                                uniq([...tags, value.toLowerCase()]),
                                { shouldValidate: true }
                              )
                            }
                            tagRef.current.value = ''
                          }
                        }
                      }}
                    />
                    {tags && (
                      <section className="-ml-1 flex flex-wrap pt-1">
                        {tags.map((tag) => (
                          <span key={tag}>
                            <span className="m-1 flex items-center rounded-md bg-pink-500 px-2 py-1 text-white">
                              <span className="flex-1">{tag}</span>
                              <button
                                className="ml-2 text-pink-700"
                                onClick={() => {
                                  setValue(
                                    'tags',
                                    tags.filter((value) => tag !== value),
                                    { shouldValidate: true }
                                  )
                                }}
                              >
                                X
                              </button>
                            </span>
                            <input type="hidden" name="tags[]" value={tag} />
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
