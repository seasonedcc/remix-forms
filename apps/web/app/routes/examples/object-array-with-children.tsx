import { applySchema } from 'composable-functions'
import hljs from 'highlight.js/lib/common'
import { formAction } from 'remix-forms'
import { z } from 'zod'
import { metaTags } from '~/helpers'
import Example from '~/ui/example'
import { SchemaForm } from '~/ui/schema-form'
import type { Route } from './+types/object-array-with-children'

const title = 'Object array with children'
const description =
  'In this example, the array of objects uses a children render function with scoped Field components for each item.'

export const meta: Route.MetaFunction = () => metaTags({ title, description })

const code = `const schema = z.object({
  teamName: z.string().min(1),
  members: z
    .array(
      z.object({
        name: z.string().min(1),
        role: z.enum(['developer', 'designer', 'manager']),
      }),
    )
    .min(1),
})

const mutation = applySchema(schema)(async (values) => values)

export const action = async ({ request }: Route.ActionArgs) =>
  formAction({ request, schema, mutation })

export default () => (
  <SchemaForm schema={schema}>
    {({ Field, Errors, Button }) => (
      <>
        <Field name="teamName" />
        <Field name="members">
          {({ Title, Errors, Item, items, append,
              remove, AddButton, RemoveButton }) => (
            <>
              <Title />
              {items.map(({ key, index }) => (
                <Item key={key}>
                  {({ Field: MemberField }) => (
                    <>
                      <div>
                        <span>Member {index + 1}</span>
                        <RemoveButton onClick={() => remove(index)}>
                          Remove
                        </RemoveButton>
                      </div>
                      <MemberField name="name" />
                      <MemberField name="role" />
                    </>
                  )}
                </Item>
              ))}
              <AddButton onClick={() => append()}>
                Add member
              </AddButton>
              <Errors />
            </>
          )}
        </Field>
        <Errors />
        <Button />
      </>
    )}
  </SchemaForm>
)`

const schema = z.object({
  teamName: z.string().min(1),
  members: z
    .array(
      z.object({
        name: z.string().min(1),
        role: z.enum(['developer', 'designer', 'manager']),
      })
    )
    .min(1),
})

export const loader = () => ({
  code: hljs.highlight(code, { language: 'ts' }).value,
})

const mutation = applySchema(schema)(async (values) => values)

export const action = async ({ request }: Route.ActionArgs) =>
  formAction({ request, schema, mutation })

export default function Component() {
  return (
    <Example title={title} description={description}>
      <SchemaForm schema={schema}>
        {({ Field, Errors, Button }) => (
          <>
            <Field name="teamName" />
            <Field name="members">
              {({
                Title,
                Errors,
                Item,
                items,
                append,
                remove,
                AddButton,
                RemoveButton,
              }) => (
                <>
                  <Title />
                  <div className="flex flex-col gap-3">
                    {items.map(({ key, index }) => (
                      <Item key={key}>
                        {({ Field: MemberField }) => (
                          <div className="flex flex-col gap-2 rounded-lg border border-base-content/10 p-3">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-sm">
                                Member {index + 1}
                              </span>
                              <RemoveButton onClick={() => remove(index)}>
                                Remove
                              </RemoveButton>
                            </div>
                            <MemberField name="name" />
                            <MemberField name="role" />
                          </div>
                        )}
                      </Item>
                    ))}
                  </div>
                  <AddButton onClick={() => append()}>Add member</AddButton>
                  <Errors />
                </>
              )}
            </Field>
            <Errors />
            <Button />
          </>
        )}
      </SchemaForm>
    </Example>
  )
}
