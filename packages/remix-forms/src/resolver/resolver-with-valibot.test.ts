import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import * as v from 'valibot'
import { describe, expect, it } from 'vitest'

const defaultOptions = {
  fields: {},
  shouldUseNativeValidation: false,
  criteriaMode: 'firstError' as const,
}

const mainSchema = v.object({
  name: v.string(),
  age: v.number(),
  role: v.picklist(['admin', 'user']),
  bio: v.optional(v.string()),
  note: v.nullable(v.string()),
})

describe('schemaResolver with Valibot', () => {
  it('returns values and empty errors for valid data', async () => {
    const resolver = standardSchemaResolver(mainSchema)
    const values = {
      name: 'Alice',
      age: 30,
      role: 'admin' as const,
      bio: 'Hello',
      note: null,
    }

    const result = await resolver(values, undefined, defaultOptions)

    expect(result.values).toEqual(values)
    expect(result.errors).toEqual({})
  })

  it('returns errors for invalid data', async () => {
    const resolver = standardSchemaResolver(mainSchema)

    const result = await resolver(
      // @ts-expect-error intentionally passing invalid data
      { name: 42, age: 'not a number', role: 'admin', note: null },
      undefined,
      defaultOptions
    )

    expect(result.values).toEqual({})
    expect(result.errors.name).toBeDefined()
    expect(result.errors.age).toBeDefined()
  })

  it('returns multiple validation errors', async () => {
    const resolver = standardSchemaResolver(mainSchema)

    const result = await resolver(
      // @ts-expect-error intentionally passing invalid data
      { name: 42, age: 'bad', role: 'unknown', note: 123 },
      undefined,
      defaultOptions
    )

    expect(result.values).toEqual({})
    expect(result.errors.name).toBeDefined()
    expect(result.errors.age).toBeDefined()
    expect(result.errors.role).toBeDefined()
    expect(result.errors.note).toBeDefined()
  })

  it('validates nested objects', async () => {
    const nestedSchema = v.object({
      user: v.object({
        email: v.pipe(v.string(), v.email()),
        profile: v.object({
          displayName: v.string(),
        }),
      }),
    })
    const resolver = standardSchemaResolver(nestedSchema)

    const result = await resolver(
      // @ts-expect-error intentionally passing invalid data
      { user: { email: 'not-an-email', profile: { displayName: 42 } } },
      undefined,
      defaultOptions
    )

    expect(result.values).toEqual({})
    expect(result.errors.user).toBeDefined()
  })

  it('allows missing optional fields', async () => {
    const resolver = standardSchemaResolver(mainSchema)
    const values = {
      name: 'Alice',
      age: 30,
      role: 'user' as const,
      note: null,
    }

    const result = await resolver(values, undefined, defaultOptions)

    expect(result.values).toEqual(values)
    expect(result.errors).toEqual({})
  })

  it('allows null for nullable fields', async () => {
    const resolver = standardSchemaResolver(mainSchema)
    const values = {
      name: 'Alice',
      age: 30,
      role: 'admin' as const,
      note: null,
    }

    const result = await resolver(values, undefined, defaultOptions)

    expect(result.values).toEqual(values)
    expect(result.errors).toEqual({})
  })

  it('rejects invalid picklist values', async () => {
    const resolver = standardSchemaResolver(mainSchema)

    const result = await resolver(
      // @ts-expect-error intentionally passing invalid data
      { name: 'Alice', age: 30, role: 'superadmin', note: null },
      undefined,
      defaultOptions
    )

    expect(result.values).toEqual({})
    expect(result.errors.role).toBeDefined()
    expect(result.errors.role).toHaveProperty('message')
  })

  it('returns an error when a required field is missing', async () => {
    const resolver = standardSchemaResolver(mainSchema)

    const result = await resolver(
      // @ts-expect-error intentionally passing invalid data
      { name: undefined, age: 25, role: 'user', note: null },
      undefined,
      defaultOptions
    )

    expect(result.values).toEqual({})
    expect(result.errors.name).toBeDefined()
  })

  it('reports deeply nested errors', async () => {
    const deepSchema = v.object({
      level1: v.object({
        level2: v.object({
          level3: v.object({
            value: v.number(),
          }),
        }),
      }),
    })
    const resolver = standardSchemaResolver(deepSchema)

    const result = await resolver(
      // @ts-expect-error intentionally passing invalid data
      { level1: { level2: { level3: { value: 'not a number' } } } },
      undefined,
      defaultOptions
    )

    expect(result.values).toEqual({})
    expect(result.errors.level1).toBeDefined()
  })

  it('allows nullish fields to be undefined or null', async () => {
    const nullishSchema = v.object({
      tag: v.nullish(v.string()),
    })
    const resolver = standardSchemaResolver(nullishSchema)

    const withUndefined = await resolver({}, undefined, defaultOptions)
    expect(withUndefined.errors).toEqual({})

    const withNull = await resolver({ tag: null }, undefined, defaultOptions)
    expect(withNull.errors).toEqual({})

    const withValue = await resolver(
      { tag: 'hello' },
      undefined,
      defaultOptions
    )
    expect(withValue.errors).toEqual({})
  })
})
