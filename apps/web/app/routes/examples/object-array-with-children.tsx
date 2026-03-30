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
          {({ Label, Errors, Item, items, append, remove }) => (
            <>
              <Label />
              {items.map(({ key, index }) => (
                <Item key={key}>
                  {({ Field: MemberField }) => (
                    <fieldset>
                      <legend>Member {index + 1}</legend>
                      <MemberField name="name" />
                      <MemberField name="role" />
                      <button type="button" onClick={() => remove(index)}>
                        Remove
                      </button>
                    </fieldset>
                  )}
                </Item>
              ))}
              <button type="button" onClick={() => append()}>
                Add member
              </button>
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
              {({ Label, Errors, Item, items, append, remove }) => (
                <>
                  <Label />
                  {items.map(({ key, index }) => (
                    <Item key={key}>
                      {({ Field: MemberField }) => (
                        <fieldset>
                          <legend>Member {index + 1}</legend>
                          <MemberField name="name" />
                          <MemberField name="role" />
                          <button type="button" onClick={() => remove(index)}>
                            Remove
                          </button>
                        </fieldset>
                      )}
                    </Item>
                  ))}
                  <button type="button" onClick={() => append()}>
                    Add member
                  </button>
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
