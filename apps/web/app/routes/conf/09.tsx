import hljs from 'highlight.js/lib/common'
import { ActionFunction, LoaderFunction, MetaFunction } from '@remix-run/node'
import { metaTags } from '~/helpers'
import Example from '~/ui/example'
import { z } from 'zod'
import { InputError, makeDomainFunction } from 'remix-domains'
import { formAction } from 'remix-forms'
import Form from '~/ui/form'

const title = 'Custom layout'
const description = "Finally, let's make the form look exactly as before."

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
    successPath: 'conf/success/09',
  })

export default function Component() {
  return (
    <Form schema={reservationSchema}>
      {({ Field, Errors, Button }) => (
        <>
          <Field name="city" />
          <div className="flex w-full space-x-4">
            <Field name="checkIn" className="flex-1" />
            <Field name="checkOut" className="flex-1" />
          </div>
          <div className="flex w-full space-x-4">
            <Field name="adults" />
            <Field name="children" />
            <Field name="bedrooms" />
          </div>
          <Field name="specialRequests" multiline />
          <Errors />
          <Button>Make reservation</Button>
        </>
      )}
    </Form>
  )
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
    successPath: 'conf/success/09',
  })

export const handle = {
  previous: '08',
}

export default function Component() {
  return (
    <Example title={title} description={description} countLines>
      <Form schema={reservationSchema}>
        {({ Field, Errors, Button }) => (
          <>
            <Field name="city" />
            <div className="flex w-full space-x-4">
              <Field name="checkIn" className="flex-1" />
              <Field name="checkOut" className="flex-1" />
            </div>
            <div className="flex w-full space-x-4">
              <Field name="adults" className="flex-1" />
              <Field name="children" className="flex-1" />
              <Field name="bedrooms" className="flex-1" />
            </div>
            <Field name="specialRequests" multiline />
            <Errors />
            <Button>Make reservation</Button>
          </>
        )}
      </Form>
    </Example>
  )
}
