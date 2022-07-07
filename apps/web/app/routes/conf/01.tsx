import hljs from 'highlight.js/lib/common'
import {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
  redirect,
} from '@remix-run/node'
import { metaTags } from '~/helpers'
import Example from '~/ui/example'
import Input from '~/ui/input'
import Label from '~/ui/conf/label'
import Button from '~/ui/submit-button'
import Select from '~/ui/select'
import TextArea from '~/ui/text-area'
import { Form } from '@remix-run/react'

const title = 'Quick and dirty'
const description =
  "First, we'll create a barebones prototype without any validations."

export const meta: MetaFunction = () => metaTags({ title, description })

const code = `import { Form } from '@remix-run/react'
import { ActionFunction, redirect } from '@remix-run/node'
import Label from '~/ui/label'
import Input from '~/ui/input'
import Select from '~/ui/select'
import TextArea from '~/ui/text-area'
import Button from '~/ui/button'

async function makeReservation(values: Record<string, FormDataEntryValue>) {
  // Here you would store data instead
  console.log(values)
}

export const action: ActionFunction = async ({ request }) => {
  const values = Object.fromEntries(await request.formData())
  await makeReservation(values)
  return redirect('success/01')
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
      </div>
      <div className="flex w-full space-x-4">
        <div className="flex-1">
          <Label htmlFor="checkIn">Check In</Label>
          <Input name="checkIn" id="checkIn" type="date" />
        </div>
        <div className="flex-1">
          <Label htmlFor="checkOut">Check Out</Label>
          <Input name="checkOut" id="checkOut" type="date" />
        </div>
      </div>
      <div className="flex w-full space-x-4">
        <div className="flex-1">
          <Label htmlFor="adults">Adults</Label>
          <Input name="adults" id="adults" />
        </div>
        <div className="flex-1">
          <Label htmlFor="children">Children</Label>
          <Input name="children" id="children" />
        </div>
        <div className="flex-1">
          <Label htmlFor="bedrooms">Bedrooms</Label>
          <Input name="bedrooms" id="bedrooms" />
        </div>
      </div>
      <div>
        <Label htmlFor="specialRequests">Special Requests</Label>
        <TextArea name="specialRequests" id="specialRequests" />
      </div>
      <Button>Make reservation</Button>
    </Form>
  )
}
`

export const loader: LoaderFunction = () => ({
  code: hljs.highlight(code, { language: 'ts' }).value,
})

async function makeReservation(values: Record<string, FormDataEntryValue>) {
  // Here you would store data instead
  console.log(values)
}

export const action: ActionFunction = async ({ request }) => {
  const values = Object.fromEntries(await request.formData())
  await makeReservation(values)
  return redirect('conf/success/01')
}

export const handle = {
  next: '02',
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
        </div>
        <div className="flex w-full space-x-4">
          <div className="flex-1">
            <Label htmlFor="checkIn">Check In</Label>
            <Input name="checkIn" id="checkIn" type="date" />
          </div>
          <div className="flex-1">
            <Label htmlFor="checkOut">Check Out</Label>
            <Input name="checkOut" id="checkOut" type="date" />
          </div>
        </div>
        <div className="flex w-full space-x-4">
          <div className="flex-1">
            <Label htmlFor="adults">Adults</Label>
            <Input name="adults" id="adults" />
          </div>
          <div className="flex-1">
            <Label htmlFor="children">Children</Label>
            <Input name="children" id="children" />
          </div>
          <div className="flex-1">
            <Label htmlFor="bedrooms">Bedrooms</Label>
            <Input name="bedrooms" id="bedrooms" />
          </div>
        </div>
        <div>
          <Label htmlFor="specialRequests">Special Requests</Label>
          <TextArea name="specialRequests" id="specialRequests" />
        </div>
        <Button>Make reservation</Button>
      </Form>
    </Example>
  )
}
