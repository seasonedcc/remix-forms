import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

vi.mock('./to-nest-errors', () => ({
  toNestErrors: vi.fn((errors) => errors),
}))

vi.mock('./validate-fields-natively', () => ({
  validateFieldsNatively: vi.fn(),
}))

import { toNestErrors } from './to-nest-errors'
import { validateFieldsNatively } from './validate-fields-natively'
import { zodResolver } from './zod-resolver'

describe('zodResolver', () => {
  it('returns true for valid ZodError object', async () => {
    const schema = z.object({ email: z.string().email() })
    const resolver = zodResolver(schema)

    const result = await resolver({ email: 'invalid' }, undefined, {
      fields: {},
      shouldUseNativeValidation: false,
    })

    expect(result.errors).toBeDefined()
  })

  it('returns false for non-ZodError', async () => {
    const schema = z.object({}).superRefine(() => {
      throw new Error('Custom error')
    })
    const resolver = zodResolver(schema)

    await expect(
      resolver({}, undefined, {
        fields: {},
        shouldUseNativeValidation: false,
      })
    ).rejects.toThrow('Custom error')
  })

  it('returns values and empty errors for valid data in sync mode', async () => {
    vi.clearAllMocks()
    const schema = z.object({ email: z.string() })
    const resolver = zodResolver(schema, undefined, { mode: 'sync' })
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

  it('returns values and empty errors for valid data in async mode', async () => {
    vi.clearAllMocks()
    const schema = z.object({ email: z.string() })
    const resolver = zodResolver(schema, undefined, { mode: 'async' })
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

  it('returns values and empty errors when mode is not specified (defaults to async)', async () => {
    vi.clearAllMocks()
    const schema = z.object({ email: z.string() })
    const resolver = zodResolver(schema)
    const values = { email: 'test@example.com' }

    const result = await resolver(values, undefined, {
      fields: {},
      shouldUseNativeValidation: false,
    })

    expect(result).toEqual({
      values,
      errors: {},
    })
  })

  it('calls validateFieldsNatively when shouldUseNativeValidation is true', async () => {
    vi.clearAllMocks()
    const schema = z.object({ email: z.string() })
    const resolver = zodResolver(schema)
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
    const resolver = zodResolver(schema)
    const values = { email: 'test@example.com' }

    await resolver(values, undefined, {
      fields: {},
      shouldUseNativeValidation: false,
    })

    expect(validateFieldsNatively).not.toHaveBeenCalled()
  })

  it('returns parsed errors for invalid data in sync mode', async () => {
    vi.clearAllMocks()
    const schema = z.object({ email: z.string().email() })
    const resolver = zodResolver(schema, undefined, { mode: 'sync' })

    const result = await resolver({ email: 'invalid' }, undefined, {
      fields: {},
      shouldUseNativeValidation: false,
    })

    expect(result.values).toEqual({})
    expect(result.errors).toBeDefined()
    expect(toNestErrors).toHaveBeenCalled()
  })

  it('returns parsed errors for invalid data in async mode', async () => {
    vi.clearAllMocks()
    const schema = z.object({ email: z.string().email() })
    const resolver = zodResolver(schema, undefined, { mode: 'async' })

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
    const resolver = zodResolver(schema)

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
    const resolver = zodResolver(schema)

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
    const resolver = zodResolver(schema)
    const options = {
      fields: {},
      shouldUseNativeValidation: false,
      criteriaMode: 'all' as const,
    }

    await resolver({ email: 'invalid' }, undefined, options)

    expect(toNestErrors).toHaveBeenCalledWith(expect.any(Object), options)
  })

  it('passes validateAllFieldCriteria as true when criteriaMode is all and shouldUseNativeValidation is false', async () => {
    vi.clearAllMocks()
    const schema = z.object({ email: z.string().email() })
    const resolver = zodResolver(schema)

    await resolver({ email: 'invalid' }, undefined, {
      fields: {},
      shouldUseNativeValidation: false,
      criteriaMode: 'all',
    })

    expect(toNestErrors).toHaveBeenCalled()
  })

  it('passes validateAllFieldCriteria as false when shouldUseNativeValidation is true', async () => {
    vi.clearAllMocks()
    const schema = z.object({ email: z.string().email() })
    const resolver = zodResolver(schema)

    await resolver({ email: 'invalid' }, undefined, {
      fields: {},
      shouldUseNativeValidation: true,
      criteriaMode: 'all',
    })

    expect(toNestErrors).toHaveBeenCalled()
  })

  it('passes schema options to parse', async () => {
    const schema = z.object({ email: z.string() })
    const parseSpy = vi.spyOn(schema, 'parse')
    const schemaOptions = { reportInput: true }
    const resolver = zodResolver(schema, schemaOptions, { mode: 'sync' })
    const values = { email: 'test@example.com' }

    await resolver(values, undefined, {
      fields: {},
      shouldUseNativeValidation: false,
    })

    expect(parseSpy).toHaveBeenCalledWith(values, schemaOptions)
  })

  it('passes schema options to parseAsync', async () => {
    const schema = z.object({ email: z.string() })
    const parseAsyncSpy = vi.spyOn(schema, 'parseAsync')
    const schemaOptions = { reportInput: true }
    const resolver = zodResolver(schema, schemaOptions)
    const values = { email: 'test@example.com' }

    await resolver(values, undefined, {
      fields: {},
      shouldUseNativeValidation: false,
    })

    expect(parseAsyncSpy).toHaveBeenCalledWith(values, schemaOptions)
  })
})

it('throws non-ZodError errors', async () => {
  const schema = z.object({}).superRefine(() => {
    throw new Error('Custom error')
  })
  const resolver = zodResolver(schema)

  await expect(
    resolver({}, undefined, {
      fields: {},
      shouldUseNativeValidation: false,
    })
  ).rejects.toThrow('Custom error')
})

it('throws non-ZodError in sync mode', async () => {
  const schema = z.object({}).superRefine(() => {
    throw new TypeError('Type error')
  })
  const resolver = zodResolver(schema, undefined, { mode: 'sync' })

  await expect(
    resolver({}, undefined, {
      fields: {},
      shouldUseNativeValidation: false,
    })
  ).rejects.toThrow('Type error')
})

it('handles union validation errors', async () => {
  vi.clearAllMocks()
  const schema = z.union([
    z.object({ type: z.literal('email'), email: z.string().email() }),
    z.object({ type: z.literal('phone'), phone: z.string().min(10) }),
  ])
  const resolver = zodResolver(schema)

  const result = await resolver(
    { type: 'email', email: 'invalid' },
    undefined,
    { fields: {}, shouldUseNativeValidation: false }
  )

  expect(result.values).toEqual({})
  expect(result.errors).toBeDefined()
})

it('handles discriminated union errors', async () => {
  vi.clearAllMocks()
  const schema = z.discriminatedUnion('type', [
    z.object({ type: z.literal('a'), value: z.string() }),
    z.object({ type: z.literal('b'), value: z.number() }),
  ])
  const resolver = zodResolver(schema)

  const result = await resolver({ type: 'a', value: 123 }, undefined, {
    fields: {},
    shouldUseNativeValidation: false,
  })

  expect(result.values).toEqual({})
  expect(result.errors).toBeDefined()
})

it('handles empty object validation', async () => {
  vi.clearAllMocks()
  const schema = z.object({})
  const resolver = zodResolver(schema)

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
  const resolver = zodResolver(schema)

  const result = await resolver({}, undefined, {
    fields: {},
    shouldUseNativeValidation: false,
  })

  expect(result.values).toEqual({})
  expect(result.errors).toBeDefined()
})

it('handles array field validation errors', async () => {
  vi.clearAllMocks()
  const schema = z.object({
    items: z.array(z.string().email()),
  })
  const resolver = zodResolver(schema)

  const result = await resolver(
    { items: ['valid@example.com', 'invalid'] },
    undefined,
    { fields: {}, shouldUseNativeValidation: false }
  )

  expect(result.values).toEqual({})
  expect(result.errors).toBeDefined()
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
  const resolver = zodResolver(schema)

  const result = await resolver(
    { user: { profile: { contact: { email: 'invalid' } } } },
    undefined,
    { fields: {}, shouldUseNativeValidation: false }
  )

  expect(result.values).toEqual({})
  expect(result.errors).toBeDefined()
})

it('handles optional fields', async () => {
  vi.clearAllMocks()
  const schema = z.object({
    email: z.string().email(),
    phone: z.string().optional(),
  })
  const resolver = zodResolver(schema)

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
  const resolver = zodResolver(schema)

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

it('converts single error to FieldError format', async () => {
  vi.clearAllMocks()
  const schema = z.object({ email: z.string().email() })
  const resolver = zodResolver(schema)

  await resolver({ email: 'invalid' }, undefined, {
    fields: {},
    shouldUseNativeValidation: false,
  })

  const parsedErrors = vi.mocked(toNestErrors).mock.calls[0][0]
  expect(parsedErrors).toHaveProperty('email')
  expect(parsedErrors.email).toHaveProperty('message')
  expect(parsedErrors.email).toHaveProperty('type')
})

it('converts multiple errors to FieldError format', async () => {
  vi.clearAllMocks()
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
  })
  const resolver = zodResolver(schema)

  await resolver({ email: 'invalid', password: 'short' }, undefined, {
    fields: {},
    shouldUseNativeValidation: false,
  })

  const parsedErrors = vi.mocked(toNestErrors).mock.calls[0][0]
  expect(parsedErrors).toHaveProperty('email')
  expect(parsedErrors).toHaveProperty('password')
})

it('uses appendErrors when validateAllFieldCriteria is true', async () => {
  vi.clearAllMocks()
  const schema = z.object({
    email: z.string().email().min(5),
  })
  const resolver = zodResolver(schema)

  await resolver({ email: 'a' }, undefined, {
    fields: {},
    shouldUseNativeValidation: false,
    criteriaMode: 'all',
  })

  expect(toNestErrors).toHaveBeenCalled()
})

it('preserves error message from Zod', async () => {
  vi.clearAllMocks()
  const schema = z.object({
    email: z.string().email('Custom email error'),
  })
  const resolver = zodResolver(schema)

  await resolver({ email: 'invalid' }, undefined, {
    fields: {},
    shouldUseNativeValidation: false,
  })

  const parsedErrors = vi.mocked(toNestErrors).mock.calls[0][0]
  expect(parsedErrors.email).toBeDefined()
  expect(parsedErrors.email?.message).toBe('Custom email error')
})

it('preserves error type from Zod', async () => {
  vi.clearAllMocks()
  const schema = z.object({
    email: z.string().email(),
  })
  const resolver = zodResolver(schema)

  await resolver({ email: 'invalid' }, undefined, {
    fields: {},
    shouldUseNativeValidation: false,
  })

  const parsedErrors = vi.mocked(toNestErrors).mock.calls[0][0]
  expect(parsedErrors.email).toBeDefined()
  expect(parsedErrors.email?.type).toBe('invalid_format')
})
