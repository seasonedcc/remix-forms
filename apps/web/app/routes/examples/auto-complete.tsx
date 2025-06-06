import { applySchema } from 'composable-functions'
import hljs from 'highlight.js/lib/common'
import { formAction } from 'remix-forms'
import { z } from 'zod'
import { metaTags } from '~/helpers'
import Example from '~/ui/example'
import { SchemaForm } from '~/ui/schema-form'
import type { Route } from './+types/auto-complete'

const title = 'Auto complete'
const description =
  'This example demonstrates the autoComplete prop passed to Field.'

export const meta: Route.MetaFunction = () => metaTags({ title, description })

const code = `const schema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  nickname: z.string(),
  bio: z.string(),
  role: z.enum(['Designer', 'Dev']),
})

export default () => (
  <SchemaForm schema={schema}>
    {({ Field, Button, Errors }) => (
      <>
        <Field name="firstName" autoComplete="given-name" />
        <Field name="lastName" autoComplete="family-name">
          {({ Label, SmartInput, Errors }) => (
            <>
              <Label />
              <SmartInput />
              <Errors />
            </>
          )}
        </Field>
        <Field name="nickname" autoComplete="nickname">
          {({ Label, Input, Errors }) => (
            <>
              <Label />
              <Input autoComplete="off" />
              <Errors />
            </>
          )}
        </Field>
        <Field name="bio" autoComplete="on">
          {({ Label, Multiline, Errors }) => (
            <>
              <Label />
              <Multiline />
              <Errors />
            </>
          )}
        </Field>
        <Field name="role" autoComplete="organization">
          {({ Label, Select, Errors }) => (
            <>
              <Label />
              <Select />
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
  firstName: z.string(),
  lastName: z.string(),
  nickname: z.string(),
  bio: z.string(),
  role: z.enum(['Designer', 'Dev']),
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
        {({ Field, Button, Errors }) => (
          <>
            <Field name="firstName" autoComplete="given-name" />
            <Field name="lastName" autoComplete="family-name">
              {({ Label, SmartInput, Errors }) => (
                <>
                  <Label />
                  <SmartInput />
                  <Errors />
                </>
              )}
            </Field>
            <Field name="nickname" autoComplete="nickname">
              {({ Label, Input, Errors }) => (
                <>
                  <Label />
                  <Input autoComplete="off" />
                  <Errors />
                </>
              )}
            </Field>
            <Field name="bio" autoComplete="on">
              {({ Label, Multiline, Errors }) => (
                <>
                  <Label />
                  <Multiline />
                  <Errors />
                </>
              )}
            </Field>
            <Field name="role" autoComplete="organization">
              {({ Label, Select, Errors }) => (
                <>
                  <Label />
                  <Select />
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
