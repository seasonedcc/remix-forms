import { InputError } from 'composable-functions'
import { describe, expect, it } from 'vitest'
import * as z from 'zod'
import { errorMessagesForSchema, getFormValues } from './mutations'

function makeRequest(body: URLSearchParams) {
  return new Request('https://example.com', { method: 'POST', body })
}

describe('errorMessagesForSchema', () => {
  it('aggregates messages by path', () => {
    const schema = z.object({
      user: z.object({ name: z.string(), age: z.number() }),
    })
    const errors = [
      new InputError('Required', ['user', 'name']),
      new InputError('Too short', ['user', 'name']),
      new InputError('Invalid', ['user', 'age']),
      new Error('global'),
    ]

    const result = errorMessagesForSchema(errors, schema)

    expect(result).toEqual({
      user: { name: ['Required', 'Too short'], age: ['Invalid'] },
    })
  })
})

describe('getFormValues', () => {
  it('parses and coerces values from the request', async () => {
    const schema = z.object({
      name: z.string(),
      agree: z.boolean(),
      amount: z.number().optional(),
      day: z.date().nullable(),
    })
    const request = makeRequest(
      new URLSearchParams({
        name: 'Jane',
        agree: 'on',
        amount: '5',
        day: '2024-05-06',
      })
    )

    const values = await getFormValues(request, schema)

    expect(values).toEqual({
      name: 'Jane',
      agree: true,
      amount: 5,
      day: new Date(2024, 4, 6),
    })
  })

  it('defaults optional and nullable fields when missing', async () => {
    const schema = z.object({
      opt: z.string().optional(),
      nul: z.date().nullable(),
      both: z.boolean().optional().nullable(),
    })
    const request = makeRequest(new URLSearchParams())
    const values = await getFormValues(request, schema)
    expect(values).toEqual({ opt: undefined, nul: null, both: null })
  })
})
