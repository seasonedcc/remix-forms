import hljs from 'highlight.js/lib/common'
import { ActionFunction, LoaderFunction, MetaFunction } from '@remix-run/node'
import { formAction } from 'remix-forms'
import { z } from 'zod'
import Form from '~/ui/form'
import { metaTags } from '~/helpers'
import { makeDomainFunction } from 'remix-domains'
import Example from '~/ui/example'
import { useFetcher } from '@remix-run/react'
import Checkbox from '~/ui/checkbox'

const title = 'useFetcher'
const description =
  "In this example, we useFetcher to simulate adding items to a to-do list. We don't save them anywhere, but in real life you know what to do 😉"

export const meta: MetaFunction = () => metaTags({ title, description })

const code = `const schema = z.object({ name: z.string().nonempty() })

const mutation = makeDomainFunction(schema)(async (values) => values)

export const action: ActionFunction = async ({ request }) =>
  formAction({ request, schema, mutation })

export default () => {
  const fetcher = useFetcher()
  const name = fetcher.submission?.formData.get('name') || fetcher.data?.name

  return (
    <Form
      schema={schema}
      fetcher={fetcher}
      onTransition={({ transition, setFocus, reset, formState }) => {
        const { isDirty } = formState

        if (transition.submission && isDirty) {
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
    </Form>
  )
}`

const schema = z.object({ name: z.string().nonempty() })

export const loader: LoaderFunction = () => ({
  code: hljs.highlight(code, { language: 'ts' }).value,
})

const mutation = makeDomainFunction(schema)(async (values) => values)

export const action: ActionFunction = async ({ request }) =>
  formAction({ request, schema, mutation })

export default function Component() {
  const fetcher = useFetcher()
  const name = fetcher.submission?.formData.get('name') || fetcher.data?.name

  return (
    <Example title={title} description={description}>
      <Form
        schema={schema}
        fetcher={fetcher}
        onTransition={({ transition, setFocus, reset, formState }) => {
          const { isDirty } = formState

          if (transition.submission && isDirty) {
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
      </Form>
    </Example>
  )
}
