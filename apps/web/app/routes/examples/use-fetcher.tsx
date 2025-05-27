import { applySchema } from 'composable-functions'
import hljs from 'highlight.js/lib/common'
import { useFetcher } from 'react-router'
import { formAction } from 'remix-forms'
import { z } from 'zod/v4'
import { metaTags } from '~/helpers'
import Checkbox from '~/ui/checkbox'
import Example from '~/ui/example'
import { SchemaForm } from '~/ui/schema-form'
import type { Route } from './+types/use-fetcher'

const title = 'useFetcher'
const description =
  "In this example, we useFetcher to simulate adding items to a to-do list. We don't save them anywhere, but in real life you know what to do 😉"

export const meta: Route.MetaFunction = () => metaTags({ title, description })

const code = `const schema = z.object({ name: z.string().min(1) })

const mutation = applySchema(schema)(async (values) => values)

export const action = async ({ request }: Route.ActionArgs) =>
  formAction({ request, schema, mutation })

export default () => {
  const fetcher = useFetcher<{ data: { name: string } }>()

  const name = fetcher.formData
    ? String(fetcher.formData?.get('name'))
    : fetcher.data?.data.name

  return (
    <SchemaForm
      schema={schema}
      fetcher={fetcher}
      onNavigation={({ setFocus, reset, formState }) => {
        const { isDirty } = formState

        if (fetcher.formAction && isDirty) {
          setFocus('name')
          reset()
        }
      }}
    >
      {({ Field, Errors, Button }) => (
        <>
          {name ? (
            <div className="flex items-center space-x-2">
              <input type="checkbox" id={name} />
              <label htmlFor={name}>{name}</label>
            </div>
          ) : null}
          <div className="flex justify-end space-x-2">
            <Field
              name="name"
              className="flex-1 flex-col space-y-2"
              placeholder="Add to-do"
              autoFocus
            >
              {({ SmartInput, Errors }) => (
                <>
                  <SmartInput />
                  <Errors />
                </>
              )}
            </Field>
            <Button className="h-[38px] self-start" disabled={false} />
          </div>
          <Errors />
        </>
      )}
    </SchemaForm>
  )
}`

const schema = z.object({ name: z.string().min(1) })

export const loader = () => ({
  code: hljs.highlight(code, { language: 'ts' }).value,
})

const mutation = applySchema(schema)(async (values) => values)

export const action = async ({ request }: Route.ActionArgs) =>
  formAction({ request, schema, mutation })

export default function Component() {
  const fetcher = useFetcher<{ data: { name: string } }>()

  const name = fetcher.formData
    ? String(fetcher.formData?.get('name'))
    : fetcher.data?.data.name

  return (
    <Example title={title} description={description}>
      <SchemaForm
        schema={schema}
        fetcher={fetcher}
        onNavigation={({ setFocus, reset, formState }) => {
          const { isDirty } = formState

          if (fetcher.formAction && isDirty) {
            setFocus('name')
            reset()
          }
        }}
      >
        {({ Field, Errors, Button }) => (
          <>
            {name ? (
              <div className="flex items-center space-x-2">
                <Checkbox id={name} />
                <label htmlFor={name}>{name}</label>
              </div>
            ) : null}
            <div className="flex justify-end space-x-2">
              <Field
                name="name"
                className="flex-1 flex-col space-y-2"
                placeholder="Add to-do"
                autoFocus
              >
                {({ SmartInput, Errors }) => (
                  <>
                    <SmartInput />
                    <Errors />
                  </>
                )}
              </Field>
              <Button className="h-[38px] self-start" disabled={false} />
            </div>
            <Errors />
          </>
        )}
      </SchemaForm>
    </Example>
  )
}
