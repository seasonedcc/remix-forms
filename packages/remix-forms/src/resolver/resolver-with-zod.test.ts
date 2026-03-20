import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'

const schema = z.object({
  name: z.string(),
  age: z.number(),
  role: z.enum(['admin', 'user']),
  bio: z.string().optional(),
  note: z.string().nullable(),
})

const options = {
  fields: {},
  shouldUseNativeValidation: false,
}

describe('schemaResolver with Zod', () => {
  it('returns values and empty errors for valid data', async () => {
    const resolver = standardSchemaResolver(schema)
    const values = {
      name: 'Alice',
      age: 30,
      role: 'admin' as const,
      bio: 'Hello',
      note: 'A note',
    }

    const result = await resolver(values, undefined, options)

    expect(result.values).toEqual(values)
    expect(result.errors).toEqual({})
  })

  it('returns errors for invalid data', async () => {
    const resolver = standardSchemaResolver(schema)

    const result = await resolver(
      // @ts-expect-error intentionally passing invalid data
      { name: 123, age: 'bad', role: 'admin', note: null },
      undefined,
      options
    )

    expect(result.errors.name).toEqual(
      expect.objectContaining({
        message: expect.any(String),
      })
    )
    expect(result.errors.age).toEqual(
      expect.objectContaining({
        message: expect.any(String),
      })
    )
    expect(result.values).toEqual({})
  })

  it('returns multiple validation errors', async () => {
    const resolver = standardSchemaResolver(schema)

    const result = await resolver(
      // @ts-expect-error intentionally passing invalid data
      { name: 'Alice', age: 'not-a-number', role: 'admin', note: null },
      undefined,
      options
    )

    expect(result.errors.age).toEqual(
      expect.objectContaining({ message: expect.any(String) })
    )
    expect(result.values).toEqual({})
  })

  it('validates nested objects', async () => {
    const nestedSchema = z.object({
      user: z.object({
        email: z.string().email(),
      }),
    })
    const resolver = standardSchemaResolver(nestedSchema)

    const result = await resolver(
      { user: { email: 'bad' } },
      undefined,
      options
    )

    expect(result.errors.user).toEqual(
      expect.objectContaining({
        email: expect.objectContaining({
          message: expect.any(String),
        }),
      })
    )
  })

  it('accepts missing optional fields', async () => {
    const resolver = standardSchemaResolver(schema)
    const values = {
      name: 'Alice',
      age: 30,
      role: 'admin' as const,
      note: 'hi',
    }

    const result = await resolver(values, undefined, options)

    expect(result.values).toEqual(values)
    expect(result.errors).toEqual({})
  })

  it('accepts null for nullable fields', async () => {
    const resolver = standardSchemaResolver(schema)
    const values = {
      name: 'Alice',
      age: 30,
      role: 'admin' as const,
      note: null,
    }

    const result = await resolver(values, undefined, options)

    expect(result.values).toEqual(values)
    expect(result.errors).toEqual({})
  })

  it('rejects invalid enum values', async () => {
    const resolver = standardSchemaResolver(schema)

    const result = await resolver(
      // @ts-expect-error intentionally passing invalid data
      { name: 'Alice', age: 30, role: 'superadmin', note: 'hi' },
      undefined,
      options
    )

    expect(result.errors.role).toEqual(
      expect.objectContaining({
        message: expect.any(String),
      })
    )
  })

  it('reports required field missing', async () => {
    const resolver = standardSchemaResolver(schema)

    const result = await resolver(
      // @ts-expect-error intentionally passing invalid data
      { age: 30, role: 'admin', note: 'hi' },
      undefined,
      options
    )

    expect(result.errors.name).toEqual(
      expect.objectContaining({ message: expect.any(String) })
    )
  })

  it('preserves custom error messages', async () => {
    const customSchema = z.object({
      email: z.string().email('Custom error'),
    })
    const resolver = standardSchemaResolver(customSchema)

    const result = await resolver({ email: 'bad' }, undefined, options)

    expect(result.errors.email).toEqual(
      expect.objectContaining({ message: 'Custom error' })
    )
  })

  it('handles deeply nested errors', async () => {
    const deepSchema = z.object({
      user: z.object({
        profile: z.object({
          contact: z.object({
            email: z.string().email(),
          }),
        }),
      }),
    })
    const resolver = standardSchemaResolver(deepSchema)

    const result = await resolver(
      { user: { profile: { contact: { email: 'bad' } } } },
      undefined,
      options
    )

    expect(result.errors.user).toEqual(
      expect.objectContaining({
        profile: expect.objectContaining({
          contact: expect.objectContaining({
            email: expect.objectContaining({
              message: expect.any(String),
            }),
          }),
        }),
      })
    )
  })

  it('returns errors for union validation failures', async () => {
    const unionSchema = z.object({
      value: z.union([z.string(), z.number()]),
    })
    const resolver = standardSchemaResolver(unionSchema)

    // @ts-expect-error intentionally passing invalid data
    const result = await resolver({ value: true }, undefined, options)

    expect(result.errors.value).toEqual(
      expect.objectContaining({
        message: expect.any(String),
      })
    )
  })

  it('handles empty object with required fields', async () => {
    const resolver = standardSchemaResolver(schema)

    // @ts-expect-error intentionally passing invalid data
    const result = await resolver({}, undefined, options)

    expect(result.values).toEqual({})
    expect(result.errors.name).toEqual(
      expect.objectContaining({ message: expect.any(String) })
    )
  })
})
