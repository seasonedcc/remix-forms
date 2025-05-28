import { applySchema } from 'composable-functions'
import hljs from 'highlight.js/lib/common'
import { useRef } from 'react'
import { formAction } from 'remix-forms'
import { z } from 'zod'
import { metaTags } from '~/helpers'
import Example from '~/ui/example'
import { SchemaForm } from '~/ui/schema-form'
import type { Route } from './+types/field-with-ref'

const title = 'Custom input with forward ref'
const description =
  'In this example, we use a forward ref to create a stateful tag list.'

export const meta: Route.MetaFunction = () => metaTags({ title, description })

const schema = z.object({
  tags: z.array(z.string().min(1)).min(1),
})

export const loader = () => ({
  code: hljs.highlight('', { language: 'ts' }).value,
})

const mutation = applySchema(schema)(async (values) => values)

export const action = async ({ request }: Route.ActionArgs) =>
  formAction({ request, schema, mutation })

export default function Component() {
  const tagRef = useRef<HTMLInputElement>(null)
  return (
    <Example
      title={title}
      description={
        <>
          In this example, we use a forwardRef to feed tags from the form into
          an array field.
        </>
      }
    >
      <SchemaForm schema={schema} values={{ tags: [] }}>
        {({ Field, Errors, Button, setValue, watch }) => {
          const tags = watch('tags')

          return (
            <>
              <Field name="tags">
                {({ Label, Errors, Input }) => (
                  <>
                    <Label />
                    <Input
                      className="block w-full rounded-md border-gray-300 text-gray-800 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm"
                      type="text"
                      name="oneTag"
                      ref={tagRef}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault()
                          if (tagRef.current) {
                            const value = tagRef.current.value
                            if (value) {
                              setValue('tags', [...(tags || []), value])
                            }
                            tagRef.current.value = ''
                          }
                        }
                      }}
                    />
                    <ul className="list-disc">
                      {tags?.map((tag: string) => (
                        <li key={tag}>
                          {tag}
                          <input type="hidden" name="tags[]" value={tag} />
                        </li>
                      ))}
                    </ul>
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
