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
import { useEffect } from 'react'

const title = 'Focus on error'
const description =
  "Now let's focus on the first field with error. react-hook-form already does that for client-side errors, but we still might get additional errors from the server."

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
    if (result.data.specialRequests?.match(/towels/i)) {
      return json<ActionData>({
        errors: [
          {
            code: 'custom',
            path: ['specialRequests'],
            message: "Don't be such a diva!",
          },
        ],
      })
    }

    await makeReservation(result.data)
    return redirect('conf/success/07')
  }

  return json<ActionData>({ errors: result.error.issues })
}

function Error(props: JSX.IntrinsicElements['div']) {
  return <div {...props} className="mt-1 text-red-500" role="alert" />
}

function ServerError({ name }: { name: string }) {
  const errors = useActionData<ActionData>()?.errors
  const message = errors?.find(({ path }) => path[0] === name)?.message

  if (!message) return null

  return <Error id={\`error-for-\${name}\`}>{message}</Error>
}

function FieldError({ name, errors }: { name: string; errors: any }) {
  const message = errors[name]?.message

  if (message) {
    return <Error id={\`error-for-\${name}\`}>{message}</Error>
  }

  return <ServerError name={name} />
}

export default function Component() {
  const resolver = zodResolver(reservationSchema)
  const { register, handleSubmit, formState, setFocus } = useForm({ resolver })
  const { errors } = formState
  const submit = useSubmit()
  const transition = useTransition()
  const submitting = Boolean(transition.submission)
  const serverErrors = useActionData<ActionData>()?.errors

  function serverErrorFor(name: string) {
    return serverErrors?.find(({ path }) => path[0] === name)?.message
  }

  const hasErrors = (name: string) =>
    Boolean(serverErrorFor(name) || errors[name])

  const describedBy = (name: string) =>
    hasErrors(name) ? \`error-for-\${name}\` : undefined

  const fields = [
    'city',
    'checkIn',
    'checkOut',
    'adults',
    'children',
    'bedrooms',
    'specialRequests',
  ]

  useEffect(() => {
    if (!serverErrors) return

    const field = fields.find((name) => serverErrorFor(name))
    field && setFocus(field)
  }, [serverErrors])

  return (
    <Form
      method="post"
      className="flex flex-col space-y-4"
      onSubmit={(event: any) => {
        handleSubmit(() => submit(event.target))(event)
      }}
    >
      <div>
        <Label id="label-for-city" htmlFor="city">
          City
        </Label>
        <Select
          {...register('city')}
          id="city"
          aria-labelledby="label-for-city"
          aria-required
          aria-invalid={hasErrors('city')}
          aria-describedby={describedBy('city')}
        >
          <option value="saltLakeCity">Salt Lake City</option>
          <option value="lasVegas">Las Vegas</option>
          <option value="losAngeles">Los Angeles</option>
        </Select>
        <FieldError name="city" errors={errors} />
      </div>
      <div className="flex w-full space-x-4">
        <div className="flex-1">
          <Label id="label-for-check-in" htmlFor="checkIn">
            Check In
          </Label>
          <Input
            {...register('checkIn')}
            id="checkIn"
            type="date"
            aria-labelledby="label-for-check-in"
            aria-required
            aria-invalid={hasErrors('checkIn')}
            aria-describedby={describedBy('checkIn')}
          />
          <FieldError name="checkIn" errors={errors} />
        </div>
        <div className="flex-1">
          <Label id="label-for-check-out" htmlFor="checkOut">
            Check Out
          </Label>
          <Input
            {...register('checkOut')}
            id="checkOut"
            type="date"
            aria-labelledby="label-for-check-out"
            aria-required
            aria-invalid={hasErrors('checkOut')}
            aria-describedby={describedBy('checkOut')}
          />
          <FieldError name="checkOut" errors={errors} />
        </div>
      </div>
      <div className="flex w-full space-x-4">
        <div className="flex-1">
          <Label id="label-for-adults" htmlFor="adults">
            Adults
          </Label>
          <Input
            {...register('adults')}
            id="adults"
            aria-labelledby="label-for-adults"
            aria-required
            aria-invalid={hasErrors('adults')}
            aria-describedby={describedBy('adults')}
          />
          <FieldError name="adults" errors={errors} />
        </div>
        <div className="flex-1">
          <Label id="label-for-children" htmlFor="children">
            Children
          </Label>
          <Input
            {...register('children')}
            id="children"
            aria-labelledby="label-for-children"
            aria-required
            aria-invalid={hasErrors('children')}
            aria-describedby={describedBy('children')}
          />
          <FieldError name="children" errors={errors} />
        </div>
        <div className="flex-1">
          <Label id="label-for-bedrooms" htmlFor="bedrooms">
            Bedrooms
          </Label>
          <Input
            {...register('bedrooms')}
            id="bedrooms"
            aria-labelledby="label-for-bedrooms"
            aria-required
            aria-invalid={hasErrors('bedrooms')}
            aria-describedby={describedBy('bedrooms')}
          />
          <FieldError name="bedrooms" errors={errors} />
        </div>
      </div>
      <div>
        <Label id="label-for-special-requests" htmlFor="specialRequests">
          Special Requests
        </Label>
        <TextArea
          {...register('specialRequests')}
          id="specialRequests"
          aria-labelledby="label-for-special-requests"
          aria-invalid={hasErrors('specialRequests')}
          aria-describedby={describedBy('specialRequests')}
        />
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
    if (result.data.specialRequests?.match(/towels/i)) {
      return json<ActionData>({
        errors: [
          {
            code: 'custom',
            path: ['specialRequests'],
            message: "Don't be such a diva!",
          },
        ],
      })
    }

    await makeReservation(result.data)
    return redirect('conf/success/07')
  }

  return json<ActionData>({ errors: result.error.issues })
}

function Error(props: JSX.IntrinsicElements['div']) {
  return <div {...props} className="mt-1 text-red-500" role="alert" />
}

function ServerError({ name }: { name: string }) {
  const errors = useActionData<ActionData>()?.errors
  const message = errors?.find(({ path }) => path[0] === name)?.message

  if (!message) return null

  return <Error id={`error-for-${name}`}>{message}</Error>
}

function FieldError({ name, errors }: { name: string; errors: any }) {
  const message = errors[name]?.message

  if (message) {
    return <Error id={`error-for-${name}`}>{message}</Error>
  }

  return <ServerError name={name} />
}

export const handle = {
  previous: '06',
  next: '08',
}

export default function Component() {
  const resolver = zodResolver(reservationSchema)
  const { register, handleSubmit, formState, setFocus } = useForm({ resolver })
  const { errors } = formState
  const submit = useSubmit()
  const transition = useTransition()
  const submitting = Boolean(transition.submission)
  const serverErrors = useActionData<ActionData>()?.errors

  function serverErrorFor(name: string) {
    return serverErrors?.find(({ path }) => path[0] === name)?.message
  }

  const hasErrors = (name: string) =>
    Boolean(serverErrorFor(name) || errors[name])

  const describedBy = (name: string) =>
    hasErrors(name) ? `error-for-${name}` : undefined

  const fields = [
    'city',
    'checkIn',
    'checkOut',
    'adults',
    'children',
    'bedrooms',
    'specialRequests',
  ]

  useEffect(() => {
    if (!serverErrors) return

    const field = fields.find((name) => serverErrorFor(name))
    field && setFocus(field)
  }, [serverErrors])

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
          <Label id="label-for-city" htmlFor="city">
            City
          </Label>
          <Select
            {...register('city')}
            id="city"
            aria-labelledby="label-for-city"
            aria-required
            aria-invalid={hasErrors('city')}
            aria-describedby={describedBy('city')}
          >
            <option value="saltLakeCity">Salt Lake City</option>
            <option value="lasVegas">Las Vegas</option>
            <option value="losAngeles">Los Angeles</option>
          </Select>
          <FieldError name="city" errors={errors} />
        </div>
        <div className="flex w-full space-x-4">
          <div className="flex-1">
            <Label id="label-for-check-in" htmlFor="checkIn">
              Check In
            </Label>
            <Input
              {...register('checkIn')}
              id="checkIn"
              type="date"
              aria-labelledby="label-for-check-in"
              aria-required
              aria-invalid={hasErrors('checkIn')}
              aria-describedby={describedBy('checkIn')}
            />
            <FieldError name="checkIn" errors={errors} />
          </div>
          <div className="flex-1">
            <Label id="label-for-check-out" htmlFor="checkOut">
              Check Out
            </Label>
            <Input
              {...register('checkOut')}
              id="checkOut"
              type="date"
              aria-labelledby="label-for-check-out"
              aria-required
              aria-invalid={hasErrors('checkOut')}
              aria-describedby={describedBy('checkOut')}
            />
            <FieldError name="checkOut" errors={errors} />
          </div>
        </div>
        <div className="flex w-full space-x-4">
          <div className="flex-1">
            <Label id="label-for-adults" htmlFor="adults">
              Adults
            </Label>
            <Input
              {...register('adults')}
              id="adults"
              aria-labelledby="label-for-adults"
              aria-required
              aria-invalid={hasErrors('adults')}
              aria-describedby={describedBy('adults')}
            />
            <FieldError name="adults" errors={errors} />
          </div>
          <div className="flex-1">
            <Label id="label-for-children" htmlFor="children">
              Children
            </Label>
            <Input
              {...register('children')}
              id="children"
              aria-labelledby="label-for-children"
              aria-required
              aria-invalid={hasErrors('children')}
              aria-describedby={describedBy('children')}
            />
            <FieldError name="children" errors={errors} />
          </div>
          <div className="flex-1">
            <Label id="label-for-bedrooms" htmlFor="bedrooms">
              Bedrooms
            </Label>
            <Input
              {...register('bedrooms')}
              id="bedrooms"
              aria-labelledby="label-for-bedrooms"
              aria-required
              aria-invalid={hasErrors('bedrooms')}
              aria-describedby={describedBy('bedrooms')}
            />
            <FieldError name="bedrooms" errors={errors} />
          </div>
        </div>
        <div>
          <Label id="label-for-special-requests" htmlFor="specialRequests">
            Special Requests
          </Label>
          <TextArea
            {...register('specialRequests')}
            id="specialRequests"
            aria-labelledby="label-for-special-requests"
            aria-invalid={hasErrors('specialRequests')}
            aria-describedby={describedBy('specialRequests')}
          />
          <FieldError name="specialRequests" errors={errors} />
        </div>
        <Button disabled={submitting} className="w-48">
          {submitting ? '...' : 'Make reservation'}
        </Button>
      </Form>
    </Example>
  )
}
