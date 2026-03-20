import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { Schema as S } from 'effect'
import { describe, expect, it } from 'vitest'

const defaultOptions = {
  fields: {},
  shouldUseNativeValidation: false,
  criteriaMode: 'firstError' as const,
}

const mainSchema = S.standardSchemaV1(
  S.Struct({
    name: S.String,
    age: S.Number,
    role: S.Literal('admin', 'user'),
    bio: S.optional(S.String),
  })
)

describe('schemaResolver with Effect Schema', () => {
  it('returns values and empty errors for valid data', async () => {
    const resolver = standardSchemaResolver(mainSchema)
    const values = {
      name: 'Alice',
      age: 30,
      role: 'admin' as const,
      bio: 'Hello',
    }

    const result = await resolver(values, undefined, defaultOptions)

    expect(result.values).toEqual(values)
    expect(result.errors).toEqual({})
  })

  it('returns errors for invalid data', async () => {
    const resolver = standardSchemaResolver(mainSchema)

    const result = await resolver(
      // @ts-expect-error intentionally passing invalid data
      { name: 42, age: 'not a number', role: 'admin' },
      undefined,
      defaultOptions
    )

    expect(result.values).toEqual({})
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
  })

  it('returns multiple validation errors', async () => {
    const resolver = standardSchemaResolver(mainSchema)

    const result = await resolver(
      // @ts-expect-error intentionally passing invalid data
      { name: 123, age: 'bad', role: 'admin' },
      undefined,
      defaultOptions
    )

    expect(result.values).toEqual({})
    expect(result.errors.name).toBeDefined()
    expect(result.errors.age).toBeDefined()
  })

  it('validates nested objects', async () => {
    const nestedSchema = S.standardSchemaV1(
      S.Struct({
        user: S.Struct({
          email: S.String,
        }),
      })
    )
    const resolver = standardSchemaResolver(nestedSchema)

    const result = await resolver(
      // @ts-expect-error intentionally passing invalid data
      { user: { email: 42 } },
      undefined,
      defaultOptions
    )

    expect(result.values).toEqual({})
    expect(result.errors.user).toBeDefined()
  })

  it('allows missing optional fields', async () => {
    const resolver = standardSchemaResolver(mainSchema)
    const values = { name: 'Alice', age: 30, role: 'admin' as const }

    const result = await resolver(values, undefined, defaultOptions)

    expect(result.values).toEqual(values)
    expect(result.errors).toEqual({})
  })

  it('returns an error when a required field is missing', async () => {
    const resolver = standardSchemaResolver(mainSchema)

    const result = await resolver(
      // @ts-expect-error intentionally passing invalid data
      { age: 25, role: 'user' },
      undefined,
      defaultOptions
    )

    expect(result.values).toEqual({})
    expect(result.errors.name).toEqual(
      expect.objectContaining({ message: expect.any(String) })
    )
  })

  it('rejects invalid literal values', async () => {
    const resolver = standardSchemaResolver(mainSchema)

    const result = await resolver(
      // @ts-expect-error intentionally passing invalid data
      { name: 'Alice', age: 30, role: 'superadmin' },
      undefined,
      defaultOptions
    )

    expect(result.values).toEqual({})
    expect(result.errors.role).toBeDefined()
    expect(result.errors.role).toHaveProperty('message')
  })

  it('handles deeply nested errors', async () => {
    const deepSchema = S.standardSchemaV1(
      S.Struct({
        level1: S.Struct({
          level2: S.Struct({
            value: S.Number,
          }),
        }),
      })
    )
    const resolver = standardSchemaResolver(deepSchema)

    const result = await resolver(
      // @ts-expect-error intentionally passing invalid data
      { level1: { level2: { value: 'not a number' } } },
      undefined,
      defaultOptions
    )

    expect(result.values).toEqual({})
    expect(result.errors.level1).toBeDefined()
  })

  it('handles empty object with required fields', async () => {
    const resolver = standardSchemaResolver(mainSchema)

    // @ts-expect-error intentionally passing invalid data
    const result = await resolver({}, undefined, defaultOptions)

    expect(result.values).toEqual({})
    expect(result.errors.name).toEqual(
      expect.objectContaining({ message: expect.any(String) })
    )
  })
})
