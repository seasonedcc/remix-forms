import hljs from 'highlight.js/lib/common'
import type { ActionFunction, LoaderArgs, MetaFunction } from '@remix-run/node'
import { formAction } from '~/formAction'
import { z } from 'zod'
import Form from '~/ui/form'
import { metaTags } from '~/helpers'
import { makeDomainFunction } from 'domain-functions'
import Example from '~/ui/example'
import { useLoaderData } from '@remix-run/react'

const title = 'Dynamic form'
const description =
  'In this example, we render a dynamic form with the fields coming from the backend.'

export const meta: MetaFunction = () => metaTags({ title, description })

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

const mutation = makeDomainFunction(fieldsSchema(getFields()))(
  async (values) => values,
)

export function loader(_args: LoaderArgs) {
  return { fields: getFields() }
}

export const action: ActionFunction = async ({ request }) =>
  formAction({ request, schema: fieldsSchema(getFields()), mutation })

export default () => {
  const { fields } = useLoaderData<typeof loader>()

  return <Form schema={fieldsSchema(fields)} />
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
      {},
    ),
  )

const mutation = makeDomainFunction(fieldsSchema(getFields()))(
  async (values) => values,
)

export function loader(_args: LoaderArgs) {
  return {
    code: hljs.highlight(code, { language: 'ts' }).value,
    fields: getFields(),
  }
}

export const action: ActionFunction = async ({ request }) =>
  formAction({ request, schema: fieldsSchema(getFields()), mutation })

export default function Component() {
  const { fields } = useLoaderData<typeof loader>()

  return (
    <Example title={title} description={description}>
      <Form schema={fieldsSchema(fields)} />
    </Example>
  )
}
