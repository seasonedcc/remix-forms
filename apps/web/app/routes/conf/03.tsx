import hljs from 'highlight.js/lib/common'
import { redirect } from 'react-router'
import { Form, useActionData } from 'react-router'
import { z } from 'zod'
import { metaTags } from '~/helpers'
import Label from '~/ui/conf/label'
import Example from '~/ui/example'
import Input from '~/ui/input'
import Select from '~/ui/select'
import Button from '~/ui/submit-button'
import TextArea from '~/ui/text-area'
import type { Route } from './+types/03'

const title = 'Type coercions'
const description =
  "But to make our server validations work, we'll need to coerce our FormData into the correct types. Let's use z.preprocess for that."

export const meta: Route.MetaFunction = () => metaTags({ title, description })

const code = `import { Form } from 'react-router'
import { redirect } from 'react-router'
import Label from '~/ui/label'
import Input from '~/ui/input'
import Select from '~/ui/select'
import TextArea from '~/ui/text-area'
import Button from '~/ui/button'
import { useActionData } from 'react-router'
import { z } from 'zod'

function parseDate(value: unknown) {
  const [year, month, day] = String(value).split('-').map(Number)
  return new Date(year, month - 1, day)
}

const reservationSchema = z.object({
  city: z.enum(['saltLakeCity', 'lasVegas', 'losAngeles']),
  checkIn: z.preprocess(parseDate, z.date()),
  checkOut: z.preprocess(parseDate, z.date()),
  adults: z.preprocess(Number, z.number().int().positive()),
  children: z.preprocess(Number, z.number().int()),
  bedrooms: z.preprocess(Number, z.number().int().positive()),
  specialRequests: z.string().optional(),
})

async function makeReservation(values: z.infer<typeof reservationSchema>) {
  // Here you would store data instead
  console.log(values)
}

export const action = async ({ request }: Route.ActionArgs) => {
  const formValues = Object.fromEntries(await request.formData())
  const result = reservationSchema.safeParse(formValues)

  if (result.success) {
    await makeReservation(result.data)
    return redirect('/conf/success/03')
  }

  return { errors: result.error.issues }
}

function renderError(name: string) {
  const errors = useActionData<Route.ComponentProps['actionData']>()?.errors
  const message = errors?.find(({ path }) => path[0] === name)?.message

  if (!message) return null

  return <div className="mt-1 text-red-500">{message}</div>
}

export default function Component() {
  return (
    <Form method="post" className="flex flex-col space-y-4">
      <div>
        <Label htmlFor="city">City</Label>
        <Select name="city" id="city">
          <option value="saltLakeCity">Salt Lake City</option>
          <option value="lasVegas">Las Vegas</option>
          <option value="losAngeles">Los Angeles</option>
        </Select>
        <FieldError name="city" />
      </div>
      <div className="flex w-full space-x-4">
        <div className="flex-1">
          <Label htmlFor="checkIn">Check In</Label>
          <Input name="checkIn" id="checkIn" type="date" />
          <FieldError name="checkIn" />
        </div>
        <div className="flex-1">
          <Label htmlFor="checkOut">Check Out</Label>
          <Input name="checkOut" id="checkOut" type="date" />
          <FieldError name="checkOut" />
        </div>
      </div>
      <div className="flex w-full space-x-4">
        <div className="flex-1">
          <Label htmlFor="adults">Adults</Label>
          <Input name="adults" id="adults" />
          <FieldError name="adults" />
        </div>
        <div className="flex-1">
          <Label htmlFor="children">Children</Label>
          <Input name="children" id="children" />
          <FieldError name="children" />
        </div>
        <div className="flex-1">
          <Label htmlFor="bedrooms">Bedrooms</Label>
          <Input name="bedrooms" id="bedrooms" />
          <FieldError name="bedrooms" />
        </div>
      </div>
      <div>
        <Label htmlFor="specialRequests">Special Requests</Label>
        <TextArea name="specialRequests" id="specialRequests" />
        <FieldError name="specialRequests" />
      </div>
      <Button>Make reservation</Button>
    </Form>
  )
}
`

export const loader = () => ({
  code: hljs.highlight(code, { language: 'ts' }).value,
})

function parseDate(value: unknown) {
  const [year, month, day] = String(value).split('-').map(Number)
  return new Date(year, month - 1, day)
}

const reservationSchema = z.object({
  city: z.enum(['saltLakeCity', 'lasVegas', 'losAngeles']),
  checkIn: z.preprocess(parseDate, z.date()),
  checkOut: z.preprocess(parseDate, z.date()),
  adults: z.preprocess(Number, z.number().int().positive()),
  children: z.preprocess(Number, z.number().int()),
  bedrooms: z.preprocess(Number, z.number().int().positive()),
  specialRequests: z.string().optional(),
})

async function makeReservation(values: z.infer<typeof reservationSchema>) {
  // Here you would store data instead
  console.log(values)
}

export const action = async ({ request }: Route.ActionArgs) => {
  const formValues = Object.fromEntries(await request.formData())
  const result = reservationSchema.safeParse(formValues)

  if (result.success) {
    await makeReservation(result.data)
    return redirect('/conf/success/03')
  }

  return { errors: result.error.issues }
}

function FieldError({ name }: { name: string }) {
  const errors = useActionData<Route.ComponentProps['actionData']>()?.errors
  const message = errors?.find(({ path }) => path[0] === name)?.message

  if (!message) return null

  return <div className="mt-1 text-red-500">{message}</div>
}

export const handle = {
  previous: '02',
  next: '04',
}

export default function Component() {
  return (
    <Example title={title} description={description} countLines>
      <Form method="post" className="flex flex-col space-y-4">
        <div>
          <Label htmlFor="city">City</Label>
          <Select name="city" id="city">
            <option value="saltLakeCity">Salt Lake City</option>
            <option value="lasVegas">Las Vegas</option>
            <option value="losAngeles">Los Angeles</option>
          </Select>
          <FieldError name="city" />
        </div>
        <div className="flex w-full space-x-4">
          <div className="flex-1">
            <Label htmlFor="checkIn">Check In</Label>
            <Input name="checkIn" id="checkIn" type="date" />
            <FieldError name="checkIn" />
          </div>
          <div className="flex-1">
            <Label htmlFor="checkOut">Check Out</Label>
            <Input name="checkOut" id="checkOut" type="date" />
            <FieldError name="checkOut" />
          </div>
        </div>
        <div className="flex w-full space-x-4">
          <div className="flex-1">
            <Label htmlFor="adults">Adults</Label>
            <Input name="adults" id="adults" />
            <FieldError name="adults" />
          </div>
          <div className="flex-1">
            <Label htmlFor="children">Children</Label>
            <Input name="children" id="children" />
            <FieldError name="children" />
          </div>
          <div className="flex-1">
            <Label htmlFor="bedrooms">Bedrooms</Label>
            <Input name="bedrooms" id="bedrooms" />
            <FieldError name="bedrooms" />
          </div>
        </div>
        <div>
          <Label htmlFor="specialRequests">Special Requests</Label>
          <TextArea name="specialRequests" id="specialRequests" />
          <FieldError name="specialRequests" />
        </div>
        <Button>Make reservation</Button>
      </Form>
    </Example>
  )
}
