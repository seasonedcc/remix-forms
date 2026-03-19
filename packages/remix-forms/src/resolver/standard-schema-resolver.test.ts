import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

vi.mock('./to-nest-errors', () => ({
  toNestErrors: vi.fn((errors) => errors),
}))

vi.mock('./validate-fields-natively', () => ({
  validateFieldsNatively: vi.fn(),
}))

import { schemaResolver } from './standard-schema-resolver'
import { toNestErrors } from './to-nest-errors'
import { validateFieldsNatively } from './validate-fields-natively'

describe('schemaResolver', () => {
  it('returns errors for invalid data', async () => {
    const schema = z.object({ email: z.string().email() })
    const resolver = schemaResolver(schema)

    const result = await resolver({ email: 'invalid' }, undefined, {
      fields: {},
      shouldUseNativeValidation: false,
    })

    expect(result.errors).toBeDefined()
  })

  it('returns values and empty errors for valid data', async () => {
    vi.clearAllMocks()
    const schema = z.object({ email: z.string() })
    const resolver = schemaResolver(schema)
    const values = { email: 'test@example.com' }

    const result = await resolver(values, undefined, {
      fields: {},
      shouldUseNativeValidation: false,
    })

    expect(result).toEqual({
      values,
      errors: {},
    })
    expect(validateFieldsNatively).not.toHaveBeenCalled()
  })

  it('calls validateFieldsNatively when shouldUseNativeValidation is true', async () => {
    vi.clearAllMocks()
    const schema = z.object({ email: z.string() })
    const resolver = schemaResolver(schema)
    const values = { email: 'test@example.com' }
    const options = {
      fields: {},
      shouldUseNativeValidation: true,
    }

    await resolver(values, undefined, options)

    expect(validateFieldsNatively).toHaveBeenCalledWith({}, options)
  })

  it('does not call validateFieldsNatively when shouldUseNativeValidation is false', async () => {
    vi.clearAllMocks()
    const schema = z.object({ email: z.string() })
    const resolver = schemaResolver(schema)
    const values = { email: 'test@example.com' }

    await resolver(values, undefined, {
      fields: {},
      shouldUseNativeValidation: false,
    })

    expect(validateFieldsNatively).not.toHaveBeenCalled()
  })

  it('returns parsed errors for invalid data', async () => {
    vi.clearAllMocks()
    const schema = z.object({ email: z.string().email() })
    const resolver = schemaResolver(schema)

    const result = await resolver({ email: 'invalid' }, undefined, {
      fields: {},
      shouldUseNativeValidation: false,
    })

    expect(result.values).toEqual({})
    expect(result.errors).toBeDefined()
    expect(toNestErrors).toHaveBeenCalled()
  })

  it('handles multiple validation errors', async () => {
    vi.clearAllMocks()
    const schema = z.object({
      email: z.string().email(),
      age: z.number().positive(),
    })
    const resolver = schemaResolver(schema)

    const result = await resolver({ email: 'invalid', age: -5 }, undefined, {
      fields: {},
      shouldUseNativeValidation: false,
    })

    expect(result.values).toEqual({})
    expect(result.errors).toBeDefined()
    expect(toNestErrors).toHaveBeenCalled()
  })

  it('handles nested object validation errors', async () => {
    vi.clearAllMocks()
    const schema = z.object({
      user: z.object({
        email: z.string().email(),
      }),
    })
    const resolver = schemaResolver(schema)

    const result = await resolver({ user: { email: 'invalid' } }, undefined, {
      fields: {},
      shouldUseNativeValidation: false,
    })

    expect(result.values).toEqual({})
    expect(result.errors).toBeDefined()
  })

  it('calls toNestErrors with parsed errors and options', async () => {
    vi.clearAllMocks()
    const schema = z.object({ email: z.string().email() })
    const resolver = schemaResolver(schema)
    const options = {
      fields: {},
      shouldUseNativeValidation: false,
      criteriaMode: 'all' as const,
    }

    await resolver({ email: 'invalid' }, undefined, options)

    expect(toNestErrors).toHaveBeenCalledWith(expect.any(Object), options)
  })

  it('handles empty object validation', async () => {
    vi.clearAllMocks()
    const schema = z.object({})
    const resolver = schemaResolver(schema)

    const result = await resolver({}, undefined, {
      fields: {},
      shouldUseNativeValidation: false,
    })

    expect(result).toEqual({
      values: {},
      errors: {},
    })
  })

  it('handles required field missing', async () => {
    vi.clearAllMocks()
    const schema = z.object({ email: z.string() })
    const resolver = schemaResolver(schema)

    const result = await resolver({}, undefined, {
      fields: {},
      shouldUseNativeValidation: false,
    })

    expect(result.values).toEqual({})
    expect(result.errors).toBeDefined()
  })

  it('handles optional fields', async () => {
    vi.clearAllMocks()
    const schema = z.object({
      email: z.string().email(),
      phone: z.string().optional(),
    })
    const resolver = schemaResolver(schema)

    const result = await resolver({ email: 'test@example.com' }, undefined, {
      fields: {},
      shouldUseNativeValidation: false,
    })

    expect(result).toEqual({
      values: { email: 'test@example.com' },
      errors: {},
    })
  })

  it('handles nullable fields', async () => {
    vi.clearAllMocks()
    const schema = z.object({
      email: z.string().email(),
      phone: z.string().nullable(),
    })
    const resolver = schemaResolver(schema)

    const result = await resolver(
      { email: 'test@example.com', phone: null },
      undefined,
      { fields: {}, shouldUseNativeValidation: false }
    )

    expect(result).toEqual({
      values: { email: 'test@example.com', phone: null },
      errors: {},
    })
  })

  it('converts errors to FieldError format with validation type', async () => {
    vi.clearAllMocks()
    const schema = z.object({ email: z.string().email() })
    const resolver = schemaResolver(schema)

    await resolver({ email: 'invalid' }, undefined, {
      fields: {},
      shouldUseNativeValidation: false,
    })

    const parsedErrors = vi.mocked(toNestErrors).mock.calls[0][0]
    expect(parsedErrors).toHaveProperty('email')
    expect(parsedErrors.email).toHaveProperty('message')
    expect(parsedErrors.email?.type).toBe('validation')
  })

  it('converts multiple errors to FieldError format', async () => {
    vi.clearAllMocks()
    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(8),
    })
    const resolver = schemaResolver(schema)

    await resolver({ email: 'invalid', password: 'short' }, undefined, {
      fields: {},
      shouldUseNativeValidation: false,
    })

    const parsedErrors = vi.mocked(toNestErrors).mock.calls[0][0]
    expect(parsedErrors).toHaveProperty('email')
    expect(parsedErrors).toHaveProperty('password')
  })

  it('preserves error message from schema', async () => {
    vi.clearAllMocks()
    const schema = z.object({
      email: z.string().email('Custom email error'),
    })
    const resolver = schemaResolver(schema)

    await resolver({ email: 'invalid' }, undefined, {
      fields: {},
      shouldUseNativeValidation: false,
    })

    const parsedErrors = vi.mocked(toNestErrors).mock.calls[0][0]
    expect(parsedErrors.email).toBeDefined()
    expect(parsedErrors.email?.message).toBe('Custom email error')
  })

  it('handles deeply nested validation errors', async () => {
    vi.clearAllMocks()
    const schema = z.object({
      user: z.object({
        profile: z.object({
          contact: z.object({
            email: z.string().email(),
          }),
        }),
      }),
    })
    const resolver = schemaResolver(schema)

    const result = await resolver(
      { user: { profile: { contact: { email: 'invalid' } } } },
      undefined,
      { fields: {}, shouldUseNativeValidation: false }
    )

    expect(result.values).toEqual({})
    expect(result.errors).toBeDefined()
  })

  it('handles union validation errors', async () => {
    vi.clearAllMocks()
    const schema = z.union([
      z.object({ type: z.literal('email'), email: z.string().email() }),
      z.object({ type: z.literal('phone'), phone: z.string().min(10) }),
    ])
    const resolver = schemaResolver(schema)

    const result = await resolver(
      { type: 'email', email: 'invalid' },
      undefined,
      { fields: {}, shouldUseNativeValidation: false }
    )

    expect(result.values).toEqual({})
    expect(result.errors).toBeDefined()
  })
})
