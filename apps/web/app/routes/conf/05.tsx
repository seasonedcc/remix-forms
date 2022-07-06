import hljs from 'highlight.js/lib/common'
import {
  ActionFunction,
  json,
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
import { Form, useActionData, useSubmit, useTransition } from '@remix-run/react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const title = 'Pending UI'
const description =
  "Now let's change the text of the submit button and disable it while submitting."

export const meta: MetaFunction = () => metaTags({ title, description })

const code = `import { Form } from '@remix-run/react'
import { ActionFunction, redirect, json } from '@remix-run/node'
import Label from '~/ui/label'
import Input from '~/ui/input'
import Select from '~/ui/select'
import TextArea from '~/ui/text-area'
import Button from '~/ui/button'
import { useActionData } from '@remix-run/react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

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

type ActionData = { errors: z.ZodIssue[] }

export const action: ActionFunction = async ({ request }) => {
  const formValues = Object.fromEntries(await request.formData())
  const result = reservationSchema.safeParse(formValues)

  if (result.success) {
    await makeReservation(result.data)
    return redirect('conf/success/05')
  }

  return json<ActionData>({ errors: result.error.issues })
}

function Error(props: JSX.IntrinsicElements['div']) {
  return <div {...props} className="mt-1 text-red-500" />
}

function ServerError({ name }: { name: string }) {
  const errors = useActionData<ActionData>()?.errors
  const message = errors?.find(({ path }) => path[0] === name)?.message

  if (!message) return null

  return <Error>{message}</Error>
}

function FieldError({ name, errors }: { name: string; errors: any }) {
  const message = errors[name]?.message

  if (message) {
    return <Error>{message}</Error>
  }

  return <ServerError name={name} />
}

export default function Component() {
  const resolver = zodResolver(reservationSchema)
  const { register, handleSubmit, formState } = useForm({ resolver })
  const { errors } = formState
  const submit = useSubmit()
  const transition = useTransition()
  const submitting = Boolean(transition.submission)

  return (
    <Form
      method="post"
      className="flex flex-col space-y-4"
      onSubmit={(event: any) => {
        handleSubmit(() => submit(event.target))(event)
      }}
    >
      <div>
        <Label htmlFor="city">City</Label>
        <Select {...register('city')} id="city">
          <option value="saltLakeCity">Salt Lake City</option>
          <option value="lasVegas">Las Vegas</option>
          <option value="losAngeles">Los Angeles</option>
        </Select>
        <FieldError name="city" errors={errors} />
      </div>
      <div className="flex w-full space-x-4">
        <div className="flex-1">
          <Label htmlFor="checkIn">Check In</Label>
          <Input {...register('checkIn')} id="checkIn" type="date" />
          <FieldError name="checkIn" errors={errors} />
        </div>
        <div className="flex-1">
          <Label htmlFor="checkOut">Check Out</Label>
          <Input {...register('checkOut')} id="checkOut" type="date" />
          <FieldError name="checkOut" errors={errors} />
        </div>
      </div>
      <div className="flex w-full space-x-4">
        <div className="flex-1">
          <Label htmlFor="adults">Adults</Label>
          <Input {...register('adults')} id="adults" />
          <FieldError name="adults" errors={errors} />
        </div>
        <div className="flex-1">
          <Label htmlFor="children">Children</Label>
          <Input {...register('children')} id="children" />
          <FieldError name="children" errors={errors} />
        </div>
        <div className="flex-1">
          <Label htmlFor="bedrooms">Bedrooms</Label>
          <Input {...register('bedrooms')} id="bedrooms" />
          <FieldError name="bedrooms" errors={errors} />
        </div>
      </div>
      <div>
        <Label htmlFor="specialRequests">Special Requests</Label>
        <TextArea {...register('specialRequests')} id="specialRequests" />
        <FieldError name="specialRequests" errors={errors} />
      </div>
      <Button disabled={submitting} className="w-48">
        {submitting ? '...' : 'Make reservation'}
      </Button>
    </Form>
  )
}`

export const loader: LoaderFunction = () => ({
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

type ActionData = { errors: z.ZodIssue[] }

export const action: ActionFunction = async ({ request }) => {
  const formValues = Object.fromEntries(await request.formData())
  const result = reservationSchema.safeParse(formValues)

  if (result.success) {
    await makeReservation(result.data)
    return redirect('conf/success/05')
  }

  return json<ActionData>({ errors: result.error.issues })
}

function Error(props: JSX.IntrinsicElements['div']) {
  return <div {...props} className="mt-1 text-red-500" />
}

function ServerError({ name }: { name: string }) {
  const errors = useActionData<ActionData>()?.errors
  const message = errors?.find(({ path }) => path[0] === name)?.message

  if (!message) return null

  return <Error>{message}</Error>
}

function FieldError({ name, errors }: { name: string; errors: any }) {
  const message = errors[name]?.message

  if (message) {
    return <Error>{message}</Error>
  }

  return <ServerError name={name} />
}

export const handle = {
  previous: '04',
  next: '06',
}

export default function Component() {
  const resolver = zodResolver(reservationSchema)
  const { register, handleSubmit, formState } = useForm({ resolver })
  const { errors } = formState
  const submit = useSubmit()
  const transition = useTransition()
  const submitting = Boolean(transition.submission)

  return (
    <Example title={title} description={description} countLines>
      <Form
        method="post"
        className="flex flex-col space-y-4"
        onSubmit={(event: any) => {
          handleSubmit(() => submit(event.target))(event)
        }}
      >
        <div>
          <Label htmlFor="city">City</Label>
          <Select {...register('city')} id="city">
            <option value="saltLakeCity">Salt Lake City</option>
            <option value="lasVegas">Las Vegas</option>
            <option value="losAngeles">Los Angeles</option>
          </Select>
          <FieldError name="city" errors={errors} />
        </div>
        <div className="flex w-full space-x-4">
          <div className="flex-1">
            <Label htmlFor="checkIn">Check In</Label>
            <Input {...register('checkIn')} id="checkIn" type="date" />
            <FieldError name="checkIn" errors={errors} />
          </div>
          <div className="flex-1">
            <Label htmlFor="checkOut">Check Out</Label>
            <Input {...register('checkOut')} id="checkOut" type="date" />
            <FieldError name="checkOut" errors={errors} />
          </div>
        </div>
        <div className="flex w-full space-x-4">
          <div className="flex-1">
            <Label htmlFor="adults">Adults</Label>
            <Input {...register('adults')} id="adults" />
            <FieldError name="adults" errors={errors} />
          </div>
          <div className="flex-1">
            <Label htmlFor="children">Children</Label>
            <Input {...register('children')} id="children" />
            <FieldError name="children" errors={errors} />
          </div>
          <div className="flex-1">
            <Label htmlFor="bedrooms">Bedrooms</Label>
            <Input {...register('bedrooms')} id="bedrooms" />
            <FieldError name="bedrooms" errors={errors} />
          </div>
        </div>
        <div>
          <Label htmlFor="specialRequests">Special Requests</Label>
          <TextArea {...register('specialRequests')} id="specialRequests" />
          <FieldError name="specialRequests" errors={errors} />
        </div>
        <Button disabled={submitting} className="w-48">
          {submitting ? '...' : 'Make reservation'}
        </Button>
      </Form>
    </Example>
  )
}
