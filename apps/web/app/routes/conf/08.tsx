import hljs from 'highlight.js/lib/common'
import { ActionFunction, LoaderFunction, MetaFunction } from '@remix-run/node'
import { metaTags } from '~/helpers'
import Example from '~/ui/example'
import { z } from 'zod'
import { InputError, makeDomainFunction } from 'remix-domains'
import { formAction } from 'remix-forms'
import Form from '~/ui/form'

const title = 'Auto-generated'
const description =
  "Now let's have Remix Forms do it all for us. We'll still have to customize the layout, but the UX is there. Like magic! 🪄"

export const meta: MetaFunction = () => metaTags({ title, description })

const code = `import { ActionFunction } from '@remix-run/node'
import { z } from 'zod'
import { InputError, makeDomainFunction } from 'remix-domains'
import { Form, formAction } from 'remix-forms'

const reservationSchema = z.object({
  city: z.enum(['saltLakeCity', 'lasVegas', 'losAngeles']),
  checkIn: z.date(),
  checkOut: z.date(),
  adults: z.number().int().positive(),
  children: z.number().int(),
  bedrooms: z.number().int().positive(),
  specialRequests: z.string().optional(),
})

const makeReservation = makeDomainFunction(reservationSchema)(
  async (values) => {
    if (values.specialRequests?.match(/towels/i)) {
      throw new InputError("Don't be such a diva!", 'specialRequests')
    }

    // Here you would store data instead
    console.log(values)
  },
)

export const action: ActionFunction = async ({ request }) =>
  formAction({
    request,
    schema: reservationSchema,
    mutation: makeReservation,
    successPath: 'conf/success/08',
  })

export default function Component() {
  return <Form schema={reservationSchema} />
}`

export const loader: LoaderFunction = () => ({
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

const makeReservation = makeDomainFunction(reservationSchema)(
  async (values) => {
    if (values.specialRequests?.match(/towels/i)) {
      throw new InputError("Don't be such a diva!", 'specialRequests')
    }

    // Here you would store data instead
    console.log(values)
  },
)

export const action: ActionFunction = async ({ request }) =>
  formAction({
    request,
    schema: reservationSchema,
    mutation: makeReservation,
    successPath: 'conf/success/08',
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
