import { Schema as S } from 'effect'
import { describe, expect, it } from 'vitest'
import { schemaResolver } from './standard-schema-resolver'

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
    const resolver = schemaResolver(mainSchema)
    const values = { name: 'Alice', age: 30, role: 'admin', bio: 'Hello' }

    const result = await resolver(values, undefined, defaultOptions)

    expect(result.values).toEqual(values)
    expect(result.errors).toEqual({})
  })

  it('returns errors for invalid data', async () => {
    const resolver = schemaResolver(mainSchema)

    const result = await resolver(
      // biome-ignore lint/suspicious/noExplicitAny: intentionally passing invalid data to test validation
      { name: 42, age: 'not a number', role: 'admin' } as any,
      undefined,
      defaultOptions
    )

    expect(result.values).toEqual({})
    expect(result.errors.name).toEqual(
      expect.objectContaining({
        message: expect.any(String),
        type: 'validation',
      })
    )
    expect(result.errors.age).toEqual(
      expect.objectContaining({
        message: expect.any(String),
        type: 'validation',
      })
    )
  })

  it('returns multiple validation errors', async () => {
    const resolver = schemaResolver(mainSchema)

    const result = await resolver(
      // biome-ignore lint/suspicious/noExplicitAny: intentionally passing invalid data to test validation
      { name: 123, age: 'bad', role: 'admin' } as any,
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
    const resolver = schemaResolver(nestedSchema)

    const result = await resolver(
      { user: { email: 42 } },
      undefined,
      defaultOptions
    )

    expect(result.values).toEqual({})
    expect(result.errors.user).toBeDefined()
  })

  it('allows missing optional fields', async () => {
    const resolver = schemaResolver(mainSchema)
    const values = { name: 'Alice', age: 30, role: 'admin' }

    const result = await resolver(values, undefined, defaultOptions)

    expect(result.values).toEqual(values)
    expect(result.errors).toEqual({})
  })

  it('returns an error when a required field is missing', async () => {
    const resolver = schemaResolver(mainSchema)

    const result = await resolver(
      // biome-ignore lint/suspicious/noExplicitAny: intentionally passing invalid data to test validation
      { age: 25, role: 'user' } as any,
      undefined,
      defaultOptions
    )

    expect(result.values).toEqual({})
    expect(result.errors.name).toEqual(
      expect.objectContaining({ type: 'validation' })
    )
  })

  it('rejects invalid literal values', async () => {
    const resolver = schemaResolver(mainSchema)

    const result = await resolver(
      { name: 'Alice', age: 30, role: 'superadmin' },
      undefined,
      defaultOptions
    )

    expect(result.values).toEqual({})
    expect(result.errors.role).toBeDefined()
    expect(result.errors.role).toHaveProperty('message')
    expect(result.errors.role).toHaveProperty('type', 'validation')
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
    const resolver = schemaResolver(deepSchema)

    const result = await resolver(
      { level1: { level2: { value: 'not a number' } } },
      undefined,
      defaultOptions
    )

    expect(result.values).toEqual({})
    expect(result.errors.level1).toBeDefined()
  })

  it('handles empty object with required fields', async () => {
    const resolver = schemaResolver(mainSchema)

    // biome-ignore lint/suspicious/noExplicitAny: intentionally passing invalid data to test validation
    const result = await resolver({} as any, undefined, defaultOptions)

    expect(result.values).toEqual({})
    expect(result.errors.name).toEqual(
      expect.objectContaining({ type: 'validation' })
    )
  })
})
