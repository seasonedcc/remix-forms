import { type } from 'arktype'
import { describe, expect, it } from 'vitest'
import { schemaResolver } from './standard-schema-resolver'

const defaultOptions = {
  fields: {},
  shouldUseNativeValidation: false,
  criteriaMode: 'firstError' as const,
}

const mainSchema = type({
  name: 'string',
  age: 'number',
  active: 'boolean',
  'bio?': 'string',
})

describe('schemaResolver with ArkType', () => {
  it('returns values and empty errors for valid data', async () => {
    const resolver = schemaResolver(mainSchema)
    const values = { name: 'Alice', age: 30, active: true, bio: 'Hello' }

    const result = await resolver(values, undefined, defaultOptions)

    expect(result.values).toEqual(values)
    expect(result.errors).toEqual({})
  })

  it('returns errors for invalid data', async () => {
    const resolver = schemaResolver(mainSchema)

    const result = await resolver(
      { name: 42, age: 'not a number', active: true },
      undefined,
      defaultOptions
    )

    expect(result.values).toEqual({})
    expect(result.errors.name).toBeDefined()
    expect(result.errors.age).toBeDefined()
  })

  it('returns multiple validation errors', async () => {
    const resolver = schemaResolver(mainSchema)

    const result = await resolver(
      { name: 123, age: 'bad', active: 'not boolean' },
      undefined,
      defaultOptions
    )

    expect(result.values).toEqual({})
    expect(result.errors.name).toBeDefined()
    expect(result.errors.age).toBeDefined()
    expect(result.errors.active).toBeDefined()
  })

  it('validates nested objects', async () => {
    const nestedSchema = type({
      user: {
        email: 'string',
      },
    })
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
    const values = { name: 'Bob', age: 25, active: false }

    const result = await resolver(values, undefined, defaultOptions)

    expect(result.values).toEqual(values)
    expect(result.errors).toEqual({})
  })

  it('returns an error when a required field is missing', async () => {
    const resolver = schemaResolver(mainSchema)

    const result = await resolver(
      { name: undefined, age: 25, active: true },
      undefined,
      defaultOptions
    )

    expect(result.values).toEqual({})
    expect(result.errors.name).toBeDefined()
  })
})
