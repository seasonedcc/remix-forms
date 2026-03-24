import hljs from 'highlight.js/lib/common'
import { z } from 'zod'
import { metaTags } from '~/helpers'
import Example from '~/ui/example'
import { SchemaForm } from '~/ui/schema-form'
import type { Route } from './+types/button-name-value'

const title = 'Button name and value'
const description =
  'In this example, we ensure that button name and value are serialized on client-side submit.'

export const meta: Route.MetaFunction = () => metaTags({ title, description })

const schema = z.object({
  name: z.string().min(1),
})

export const loader = () => ({
  code: hljs.highlight('', { language: 'ts' }).value,
})

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData()
  const data = Object.fromEntries(formData)
  return { success: true, data }
}

export default function Component() {
  return (
    <Example title={title} description={description}>
      <SchemaForm schema={schema}>
        {({ Field, Errors, Button }) => (
          <>
            <Field name="name" />
            <Errors />
            <Button name="_action" value="save">
              Save
            </Button>
            <Button name="_action" value="delete">
              Delete
            </Button>
          </>
        )}
      </SchemaForm>
    </Example>
  )
}
