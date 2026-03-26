import type { FileUpload } from '@remix-run/form-data-parser'
import { applySchema } from 'composable-functions'
import hljs from 'highlight.js/lib/common'
import { formAction } from 'remix-forms'
import { z } from 'zod'
import { metaTags } from '~/helpers'
import Example from '~/ui/example'
import { SchemaForm } from '~/ui/schema-form'
import type { Route } from './+types/file-upload'

const title = 'File upload'
const description =
  'In this example, a file field is auto-generated from the schema using z.instanceof(File).'

export const meta: Route.MetaFunction = () => metaTags({ title, description })

const code = `const schema = z.object({
  name: z.string().min(1),
  avatar: z
    .instanceof(File)
    .refine((f) => f.size <= 2_000_000, 'Max file size is 2MB')
    .refine(
      (f) => f.type.startsWith('image/'),
      'Only image files are allowed',
    ),
})

const mutation = applySchema(schema)(async (values) => ({
  name: values.name,
  fileName: values.avatar.name,
  fileSize: values.avatar.size,
}))

async function uploadHandler(fileUpload: FileUpload) {
  return fileUpload
}

export const action = async ({ request }: Route.ActionArgs) =>
  formAction({ request, schema, mutation, uploadHandler })

export default () => (
  <SchemaForm schema={schema} accept={{ avatar: 'image/*' }} />
)`

const schema = z.object({
  name: z.string().min(1),
  avatar: z
    .instanceof(File)
    .refine((f) => f.size <= 2_000_000, 'Max file size is 2MB')
    .refine((f) => f.type.startsWith('image/'), 'Only image files are allowed'),
})

export const loader = () => ({
  code: hljs.highlight(code, { language: 'ts' }).value,
})

const mutation = applySchema(schema)(async (values) => ({
  name: values.name,
  fileName: values.avatar.name,
  fileSize: values.avatar.size,
}))

async function uploadHandler(fileUpload: FileUpload) {
  return fileUpload
}

export const action = async ({ request }: Route.ActionArgs) =>
  formAction({ request, schema, mutation, uploadHandler })

export default function Component() {
  return (
    <Example title={title} description={description}>
      <SchemaForm schema={schema} accept={{ avatar: 'image/*' }} />
    </Example>
  )
}
