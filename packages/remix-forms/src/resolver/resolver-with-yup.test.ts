import { describe, expect, it } from 'vitest'
import * as yup from 'yup'
import { schemaResolver } from './standard-schema-resolver'

const schema = yup.object({
  name: yup.string().required(),
  age: yup.number().required(),
  role: yup.string().oneOf(['admin', 'user']).required(),
  bio: yup.string(),
  note: yup.string().required().nullable(),
})

const options = {
  fields: {},
  shouldUseNativeValidation: false,
}

describe('schemaResolver with Yup', () => {
  it('returns values and empty errors for valid data', async () => {
    const resolver = schemaResolver(schema)
    const values = {
      name: 'Alice',
      age: 30,
      role: 'admin',
      bio: 'Hello',
      note: 'A note',
    }

    const result = await resolver(values, undefined, options)

    expect(result.values).toEqual(values)
    expect(result.errors).toEqual({})
  })

  it('returns errors for invalid data', async () => {
    const resolver = schemaResolver(schema)

    const result = await resolver(
      // biome-ignore lint/suspicious/noExplicitAny: intentionally passing invalid data to test validation
      { name: '', age: 'bad', role: 'admin', note: 'hi' } as any,
      undefined,
      options
    )

    expect(Object.keys(result.errors).length).toBeGreaterThan(0)
    expect(result.values).toEqual({})
  })

  it('returns multiple validation errors', async () => {
    const resolver = schemaResolver(schema)

    const result = await resolver(
      // biome-ignore lint/suspicious/noExplicitAny: intentionally passing invalid data to test validation
      { role: 'admin', note: 'hi' } as any,
      undefined,
      options
    )

    expect(result.errors.name).toEqual(
      expect.objectContaining({ type: 'validation' })
    )
    expect(result.errors.age).toEqual(
      expect.objectContaining({ type: 'validation' })
    )
    expect(result.values).toEqual({})
  })

  it('validates nested objects', async () => {
    const nestedSchema = yup.object({
      user: yup
        .object({
          email: yup.string().email().required(),
        })
        .required(),
    })
    const resolver = schemaResolver(nestedSchema)

    const result = await resolver(
      { user: { email: 'bad' } },
      undefined,
      options
    )

    expect(result.errors.user).toEqual(
      expect.objectContaining({
        email: expect.objectContaining({
          message: expect.any(String),
          type: 'validation',
        }),
      })
    )
  })

  it('accepts missing optional fields', async () => {
    const resolver = schemaResolver(schema)
    const values = { name: 'Alice', age: 30, role: 'admin', note: 'hi' }

    const result = await resolver(values, undefined, options)

    expect(result.values).toEqual(values)
    expect(result.errors).toEqual({})
  })

  it('accepts null for nullable fields', async () => {
    const resolver = schemaResolver(schema)
    const values = { name: 'Alice', age: 30, role: 'admin', note: null }

    const result = await resolver(values, undefined, options)

    expect(result.values).toEqual(values)
    expect(result.errors).toEqual({})
  })

  it('rejects invalid enum values', async () => {
    const resolver = schemaResolver(schema)

    const result = await resolver(
      // biome-ignore lint/suspicious/noExplicitAny: intentionally passing invalid data to test validation
      { name: 'Alice', age: 30, role: 'superadmin', note: 'hi' } as any,
      undefined,
      options
    )

    expect(result.errors.role).toEqual(
      expect.objectContaining({
        message: expect.any(String),
        type: 'validation',
      })
    )
  })

  it('reports required field missing', async () => {
    const resolver = schemaResolver(schema)

    const result = await resolver(
      // biome-ignore lint/suspicious/noExplicitAny: intentionally passing invalid data to test validation
      { age: 30, role: 'admin', note: 'hi' } as any,
      undefined,
      options
    )

    expect(result.errors.name).toEqual(
      expect.objectContaining({ type: 'validation' })
    )
  })

  it('preserves custom error messages', async () => {
    const customSchema = yup.object({
      email: yup.string().email('Custom yup error').required(),
    })
    const resolver = schemaResolver(customSchema)

    const result = await resolver({ email: 'bad' }, undefined, options)

    expect(result.errors.email).toEqual(
      expect.objectContaining({
        message: 'Custom yup error',
        type: 'validation',
      })
    )
  })

  it('handles deeply nested errors', async () => {
    const deepSchema = yup.object({
      user: yup
        .object({
          profile: yup
            .object({
              contact: yup
                .object({
                  email: yup.string().email().required(),
                })
                .required(),
            })
            .required(),
        })
        .required(),
    })
    const resolver = schemaResolver(deepSchema)

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
              type: 'validation',
            }),
          }),
        }),
      })
    )
  })

  it('returns errors for mixed type validation failures', async () => {
    const mixedSchema = yup.object({
      value: yup
        .mixed()
        .test(
          'string-or-number',
          'Must be string or number',
          (v) => typeof v === 'string' || typeof v === 'number'
        )
        .required(),
    })
    const resolver = schemaResolver(mixedSchema)

    // biome-ignore lint/suspicious/noExplicitAny: intentionally passing invalid data to test validation
    const result = await resolver({ value: true } as any, undefined, options)

    expect(result.errors.value).toEqual(
      expect.objectContaining({
        message: 'Must be string or number',
        type: 'validation',
      })
    )
  })

  it('handles empty object with required fields', async () => {
    const resolver = schemaResolver(schema)

    // biome-ignore lint/suspicious/noExplicitAny: intentionally passing invalid data to test validation
    const result = await resolver({} as any, undefined, options)

    expect(result.values).toEqual({})
    expect(result.errors.name).toEqual(
      expect.objectContaining({ type: 'validation' })
    )
  })
})
