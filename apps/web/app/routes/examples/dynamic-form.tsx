import { applySchema } from 'composable-functions'
import hljs from 'highlight.js/lib/common'
import { formAction } from 'remix-forms'
import { z } from 'zod'
import { metaTags } from '~/helpers'
import Example from '~/ui/example'
import { SchemaForm } from '~/ui/schema-form'
import type { Route } from './+types/dynamic-form'

const title = 'Dynamic form'
const description =
  'In this example, we render a dynamic form with the fields coming from the backend.'

export const meta: Route.MetaFunction = () => metaTags({ title, description })

const code = `type FieldType = 'string' | 'email' | 'int'
type Field = { name: string; type: FieldType }

const getFields = () => {
  // This would come from a database
  const fields: Field[] = [
    { name: 'firstName', type: 'string' },
    { name: 'email', type: 'email' },
    { name: 'age', type: 'int' },
  ]

  return fields
}

const typeSchemas = {
  string: z.string(),
  email: z.string().email(),
  int: z.number().int(),
}

const fieldSchema = (type: FieldType) => typeSchemas[type]

const fieldsSchema = (fields: Field[]) =>
  z.object(
    fields.reduce(
      (obj, field) => ({ ...obj, [field.name]: fieldSchema(field.type) }),
      {},
    ),
  )

const mutation = applySchema(fieldsSchema(getFields()))(
  async (values) => values,
)

export function loader() {
  return { fields: getFields() }
}

export const action = async ({ request }: Route.ActionArgs) =>
  formAction({ request, schema: fieldsSchema(getFields()), mutation })

export default ({ loaderData }: Route.ComponentProps) => {
  return <SchemaForm schema={fieldsSchema(loaderData.fields)} />
}`

type FieldType = 'string' | 'email' | 'int'
type Field = { name: string; type: FieldType }

const getFields = () => {
  const fields: Field[] = [
    { name: 'firstName', type: 'string' },
    { name: 'email', type: 'email' },
    { name: 'age', type: 'int' },
  ]

  return fields
}

const typeSchemas = {
  string: z.string(),
  email: z.string().email(),
  int: z.number().int(),
}

const fieldSchema = (type: FieldType) => typeSchemas[type]

const fieldsSchema = (fields: Field[]) =>
  z.object(
    fields.reduce(
      (obj, field) => ({ ...obj, [field.name]: fieldSchema(field.type) }),
      {}
    )
  )

const mutation = applySchema(fieldsSchema(getFields()))(
  async (values) => values
)

export function loader() {
  return {
    code: hljs.highlight(code, { language: 'ts' }).value,
    fields: getFields(),
  }
}

export const action = async ({ request }: Route.ActionArgs) =>
  formAction({ request, schema: fieldsSchema(getFields()), mutation })

export default function Component({ loaderData }: Route.ComponentProps) {
  const { fields } = loaderData

  return (
    <Example title={title} description={description}>
      <SchemaForm schema={fieldsSchema(fields)} />
    </Example>
  )
}
