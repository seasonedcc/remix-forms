import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import Joi from 'joi'
import { describe, expect, it } from 'vitest'

const defaultOptions = {
  fields: {},
  shouldUseNativeValidation: false,
  criteriaMode: 'firstError' as const,
}

const mainSchema = Joi.object({
  name: Joi.string().required(),
  age: Joi.number().required(),
  role: Joi.string().valid('admin', 'user').required(),
  bio: Joi.string(),
  note: Joi.string().required().allow(null),
})

describe('schemaResolver with Joi', () => {
  it('returns values and empty errors for valid data', async () => {
    const resolver = standardSchemaResolver(mainSchema)
    const values = {
      name: 'Alice',
      age: 30,
      role: 'admin',
      bio: 'Hello',
      note: 'A note',
    }

    const result = await resolver(values, undefined, defaultOptions)

    expect(result.values).toEqual(values)
    expect(result.errors).toEqual({})
  })

  it('returns errors for invalid data', async () => {
    const resolver = standardSchemaResolver(mainSchema)

    const result = await resolver(
      { name: 123, age: 'not a number', role: 'admin', note: null },
      undefined,
      defaultOptions
    )

    expect(result.values).toEqual({})
    expect(result.errors.name).toEqual(
      expect.objectContaining({
        message: expect.any(String),
      })
    )
  })

  it('returns errors for multiple invalid fields', async () => {
    const schema = Joi.object({
      name: Joi.string().required(),
      age: Joi.number().required(),
    })
    const resolver = standardSchemaResolver(schema)

    const result = await resolver({ name: 42 }, undefined, defaultOptions)

    expect(result.values).toEqual({})
    expect(Object.keys(result.errors).length).toBeGreaterThanOrEqual(1)
  })

  it('validates nested objects', async () => {
    const nestedSchema = Joi.object({
      user: Joi.object({
        email: Joi.string().email().required(),
      }).required(),
    })
    const resolver = standardSchemaResolver(nestedSchema)

    const result = await resolver(
      { user: { email: 'not-an-email' } },
      undefined,
      defaultOptions
    )

    expect(result.values).toEqual({})
    expect(result.errors.user).toBeDefined()
  })

  it('allows missing optional fields', async () => {
    const resolver = standardSchemaResolver(mainSchema)
    const values = { name: 'Alice', age: 30, role: 'user', note: null }

    const result = await resolver(values, undefined, defaultOptions)

    expect(result.values).toEqual(values)
    expect(result.errors).toEqual({})
  })

  it('allows null for nullable fields', async () => {
    const resolver = standardSchemaResolver(mainSchema)
    const values = { name: 'Alice', age: 30, role: 'admin', note: null }

    const result = await resolver(values, undefined, defaultOptions)

    expect(result.values).toEqual(values)
    expect(result.errors).toEqual({})
  })

  it('rejects invalid enum values', async () => {
    const resolver = standardSchemaResolver(mainSchema)

    const result = await resolver(
      { name: 'Alice', age: 30, role: 'superadmin', note: null },
      undefined,
      defaultOptions
    )

    expect(result.values).toEqual({})
    expect(result.errors.role).toEqual(
      expect.objectContaining({
        message: expect.any(String),
      })
    )
  })

  it('returns an error when a required field is missing', async () => {
    const resolver = standardSchemaResolver(mainSchema)

    const result = await resolver(
      { age: 30, role: 'admin', note: null },
      undefined,
      defaultOptions
    )

    expect(result.values).toEqual({})
    expect(result.errors.name).toEqual(
      expect.objectContaining({ message: expect.any(String) })
    )
  })

  it('preserves custom error messages', async () => {
    const customSchema = Joi.object({
      name: Joi.string().required().messages({
        'any.required': 'Name is required!',
      }),
    })
    const resolver = standardSchemaResolver(customSchema)

    const result = await resolver({}, undefined, defaultOptions)

    expect(result.values).toEqual({})
    expect(result.errors.name).toEqual(
      expect.objectContaining({
        message: 'Name is required!',
      })
    )
  })
})
