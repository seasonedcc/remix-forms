import { applySchema } from 'composable-functions'
import hljs from 'highlight.js/lib/common'
import { formAction } from 'remix-forms'
import { z } from 'zod'
import { metaTags } from '~/helpers'
import Example from '~/ui/example'
import { SchemaForm } from '~/ui/schema-form'
import type { Route } from './+types/drag-and-drop'

const title = 'Drag and drop'
const description =
  'In this example, we use renderObjectArrayItem to add drag-and-drop reordering using the web standard DnD API — no children on SchemaForm, only render functions.'

export const meta: Route.MetaFunction = () => metaTags({ title, description })

const code = `const schema = z.object({
  title: z.string().min(1),
  tasks: z.array(
    z.object({
      name: z.string().min(1),
      done: z.boolean().default(false),
    })
  ),
})

export default () => (
  <SchemaForm
    schema={schema}
    renderObjectArrayItem={({ Item, itemKey, index, move }) => (
      <div
        key={itemKey}
        draggable
        onDragStart={(e) => {
          e.dataTransfer.effectAllowed = 'move'
          e.dataTransfer.setData('text/plain', String(index))
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={(e) =>
          e.currentTarget.classList.add('outline', 'outline-primary')
        }
        onDragLeave={(e) =>
          e.currentTarget.classList.remove('outline', 'outline-primary')
        }
        onDrop={(e) => {
          e.preventDefault()
          e.currentTarget.classList.remove('outline', 'outline-primary')
          const from = Number(e.dataTransfer.getData('text/plain'))
          if (from !== index) move(from, index)
        }}
        className="cursor-grab rounded p-1 active:cursor-grabbing"
      >
        <Item />
      </div>
    )}
  />
)`

const schema = z.object({
  title: z.string().min(1),
  tasks: z.array(
    z.object({
      name: z.string().min(1),
      done: z.boolean().default(false),
    })
  ),
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
      <SchemaForm
        schema={schema}
        renderObjectArrayItem={({ Item, itemKey, index, move }) => (
          <div
            key={itemKey}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.effectAllowed = 'move'
              e.dataTransfer.setData('text/plain', String(index))
            }}
            onDragOver={(e) => e.preventDefault()}
            onDragEnter={(e) =>
              e.currentTarget.classList.add('outline', 'outline-primary')
            }
            onDragLeave={(e) =>
              e.currentTarget.classList.remove('outline', 'outline-primary')
            }
            onDrop={(e) => {
              e.preventDefault()
              e.currentTarget.classList.remove('outline', 'outline-primary')
              const from = Number(e.dataTransfer.getData('text/plain'))
              if (from !== index) move(from, index)
            }}
            className="cursor-grab rounded p-1 active:cursor-grabbing"
          >
            <Item />
          </div>
        )}
      />
    </Example>
  )
}
