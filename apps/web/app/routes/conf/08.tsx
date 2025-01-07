import hljs from 'highlight.js/lib/common'
import { metaTags } from '~/helpers'
import Example from '~/ui/example'
import { z } from 'zod'
import { InputError, applySchema } from 'composable-functions'
import Form from '~/ui/form'
import { formAction } from 'remix-forms'
import { Route } from './+types/08'

const title = 'Auto-generated'
const description =
  "Now let's have Remix Forms do it all for us. We'll still have to customize the layout, but the UX is there. Like magic! 🪄"

export const meta: Route.MetaFunction = () => metaTags({ title, description })

const code = `import { z } from 'zod'
import { InputError, applySchema } from 'composable-functions'
import { formAction } from 'remix-forms'
import { Form } from '~/form'

const reservationSchema = z.object({
  city: z.enum(['saltLakeCity', 'lasVegas', 'losAngeles']),
  checkIn: z.date(),
  checkOut: z.date(),
  adults: z.number().int().positive(),
  children: z.number().int(),
  bedrooms: z.number().int().positive(),
  specialRequests: z.string().optional(),
})

const makeReservation = applySchema(reservationSchema)(
  async (values) => {
    if (values.specialRequests?.match(/towels/i)) {
      throw new InputError("Don't be such a diva!", ['specialRequests'])
    }

    // Here you would store data instead
    console.log(values)
  },
)

export const action = async ({ request }: Route.ActionArgs) =>
  formAction({
    request,
    schema: reservationSchema,
    mutation: makeReservation,
    successPath: '/conf/success/08',
  })

export default function Component() {
  return <Form schema={reservationSchema} />
}`

export const loader = () => ({
  code: hljs.highlight(code, { language: 'ts' }).value,
})

const reservationSchema = z.object({
  city: z.enum(['saltLakeCity', 'lasVegas', 'losAngeles']),
  checkIn: z.date(),
  checkOut: z.date(),
  adults: z.number().int().positive(),
  children: z.number().int(),
  bedrooms: z.number().int().positive(),
  specialRequests: z.string().optional(),
})

const makeReservation = applySchema(reservationSchema)(async (values) => {
  if (values.specialRequests?.match(/towels/i)) {
    throw new InputError("Don't be such a diva!", ['specialRequests'])
  }

  // Here you would store data instead
  console.log(values)
})

export const action = async ({ request }: Route.ActionArgs) =>
  formAction({
    request,
    schema: reservationSchema,
    mutation: makeReservation,
    successPath: '/conf/success/08',
  })

export const handle = {
  previous: '07',
  next: '09',
}

export default function Component() {
  return (
    <Example title={title} description={description} countLines>
      <Form schema={reservationSchema} />
    </Example>
  )
}
