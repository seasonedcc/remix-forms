import { applySchema } from 'composable-functions'
import hljs from 'highlight.js/lib/common'
import { formAction } from 'remix-forms'
import { z } from 'zod'
import { metaTags } from '~/helpers'
import Example from '~/ui/example'
import { SchemaForm } from '~/ui/schema-form'
import type { Route } from './+types/array-with-children'

const title = 'Array with children'
const description =
  'In this example, the array field uses a children render function for custom layout with swap controls.'

export const meta: Route.MetaFunction = () => metaTags({ title, description })

const code = `const schema = z.object({
  listName: z.string().min(1),
  items: z.array(z.string().min(1)).min(1),
})

const mutation = applySchema(schema)(async (values) => values)

export const action = async ({ request }: Route.ActionArgs) =>
  formAction({ request, schema, mutation })

export default () => (
  <SchemaForm schema={schema}>
    {({ Field, Errors, Button }) => (
      <>
        <Field name="listName" />
        <Field name="items">
          {({ Label, Errors, items, append, remove, swap }) => (
            <>
              <Label />
              {items.map(({ key, index, SmartInput, Errors: ItemErrors }) => (
                <div key={key}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <SmartInput placeholder={\`Item \${index + 1}\`} />
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => swap(index, index - 1)}
                      >
                        Up
                      </button>
                    )}
                    <button type="button" onClick={() => remove(index)}>
                      Remove
                    </button>
                  </div>
                  <ItemErrors />
                </div>
              ))}
              <button type="button" onClick={() => append()}>
                Add item
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
  listName: z.string().min(1),
  items: z.array(z.string().min(1)).min(1),
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
            <Field name="listName" />
            <Field name="items">
              {({ Label, Errors, items, append, remove, swap }) => (
                <>
                  <Label />
                  {items.map(
                    ({ key, index, SmartInput, Errors: ItemErrors }) => (
                      <div key={key}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <SmartInput placeholder={`Item ${index + 1}`} />
                          {index > 0 && (
                            <button
                              type="button"
                              onClick={() => swap(index, index - 1)}
                            >
                              Up
                            </button>
                          )}
                          <button type="button" onClick={() => remove(index)}>
                            Remove
                          </button>
                        </div>
                        <ItemErrors />
                      </div>
                    )
                  )}
                  <button type="button" onClick={() => append()}>
                    Add item
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
