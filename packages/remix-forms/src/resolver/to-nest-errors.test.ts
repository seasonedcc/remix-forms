import type { Field, FieldError } from 'react-hook-form'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { toNestErrors } from './to-nest-errors'
import { validateFieldsNatively } from './validate-fields-natively'

vi.mock('./validate-fields-natively')

describe('toNestErrors', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns empty object when errors is empty', () => {
    const errors = {}
    const options = {
      fields: {},
      shouldUseNativeValidation: false,
    }

    const result = toNestErrors(errors, options)

    expect(result).toEqual({})
  })

  it('transforms single flat error correctly', () => {
    const errors = {
      email: { type: 'required', message: 'Email is required' },
    }
    const options = {
      fields: {},
      shouldUseNativeValidation: false,
    }

    const result = toNestErrors(errors, options)

    expect(result).toEqual({
      email: {
        type: 'required',
        message: 'Email is required',
        ref: undefined,
      },
    })
  })

  it('transforms multiple flat errors correctly', () => {
    const errors = {
      email: { type: 'required', message: 'Email is required' },
      password: { type: 'minLength', message: 'Too short' },
      username: { type: 'pattern', message: 'Invalid pattern' },
    }
    const options = {
      fields: {},
      shouldUseNativeValidation: false,
    }

    const result = toNestErrors(errors, options)

    expect(result).toEqual({
      email: {
        type: 'required',
        message: 'Email is required',
        ref: undefined,
      },
      password: {
        type: 'minLength',
        message: 'Too short',
        ref: undefined,
      },
      username: {
        type: 'pattern',
        message: 'Invalid pattern',
        ref: undefined,
      },
    })
  })

  it('handles nested path errors correctly', () => {
    const errors = {
      'user.name': { type: 'required', message: 'Name is required' },
      'user.email': { type: 'email', message: 'Invalid email' },
    }
    const options = {
      fields: {},
      shouldUseNativeValidation: false,
    }

    const result = toNestErrors(errors, options) as {
      user: {
        name: { type: string; message: string; ref: unknown }
        email: { type: string; message: string; ref: unknown }
      }
    }

    expect(result.user).toBeDefined()
    expect(result.user.name).toEqual({
      type: 'required',
      message: 'Name is required',
      ref: undefined,
    })
    expect(result.user.email).toEqual({
      type: 'email',
      message: 'Invalid email',
      ref: undefined,
    })
  })

  it('attaches field ref from options.fields to error', () => {
    const mockRef = { name: 'email', value: '' } as unknown as HTMLInputElement
    const errors = {
      email: { type: 'required', message: 'Email is required' },
    }
    const options = {
      fields: {
        email: {
          ref: mockRef,
          name: 'email',
        } as Field['_f'],
      },
      shouldUseNativeValidation: false,
    }

    const result = toNestErrors(errors, options) as {
      email: { type: string; message: string; ref: unknown }
    }

    expect(result.email.ref).toBe(mockRef)
  })

  it('handles error without field ref in options.fields', () => {
    const errors = {
      email: { type: 'required', message: 'Email is required' },
    }
    const options = {
      fields: {
        email: {} as Field['_f'],
      },
      shouldUseNativeValidation: false,
    }

    const result = toNestErrors(errors, options)

    expect(result.email).toEqual({
      type: 'required',
      message: 'Email is required',
      ref: undefined,
    })
  })

  it('handles multiple errors with mixed ref availability', () => {
    const mockRef = { name: 'email', value: '' } as unknown as HTMLInputElement
    const errors = {
      email: { type: 'required', message: 'Email is required' },
      password: { type: 'required', message: 'Password is required' },
      username: { type: 'required', message: 'Username is required' },
    }
    const options = {
      fields: {
        email: {
          ref: mockRef,
          name: 'email',
        } as Field['_f'],
        username: {} as Field['_f'],
      },
      shouldUseNativeValidation: false,
    }

    const result = toNestErrors(errors, options) as {
      email: { type: string; message: string; ref: unknown }
      password: { type: string; message: string; ref: unknown }
      username: { type: string; message: string; ref: unknown }
    }

    expect(result.email.ref).toBe(mockRef)
    expect(result.password.ref).toBeUndefined()
    expect(result.username.ref).toBeUndefined()
  })

  it('detects field array when child paths exist', () => {
    const errors = {
      items: { type: 'required', message: 'Items is required' },
    }
    const options = {
      fields: {},
      names: ['items', 'items.0.name', 'items.1.name'],
      shouldUseNativeValidation: false,
    }

    const result = toNestErrors(errors, options) as {
      items: { root: { type: string; message: string; ref: unknown } }
    }

    expect(result.items.root).toEqual({
      type: 'required',
      message: 'Items is required',
      ref: undefined,
    })
  })

  it('nests field array error under root', () => {
    const errors = {
      items: { type: 'min', message: 'At least one item required' },
    }
    const options = {
      fields: {},
      names: ['items', 'items.0', 'items.1'],
      shouldUseNativeValidation: false,
    }

    const result = toNestErrors(errors, options) as {
      items: { root: { type: string; message: string; ref: unknown } }
    }

    expect(result.items).toHaveProperty('root')
    expect(result.items.root).toEqual({
      type: 'min',
      message: 'At least one item required',
      ref: undefined,
    })
  })

  it('handles multiple field array errors', () => {
    const errors = {
      items: { type: 'required', message: 'Items required' },
      users: { type: 'min', message: 'At least one user' },
    }
    const options = {
      fields: {},
      names: ['items', 'items.0', 'users', 'users.0'],
      shouldUseNativeValidation: false,
    }

    const result = toNestErrors(errors, options) as {
      items: { root: { type: string; message: string; ref: unknown } }
      users: { root: { type: string; message: string; ref: unknown } }
    }

    expect(result.items.root).toEqual({
      type: 'required',
      message: 'Items required',
      ref: undefined,
    })
    expect(result.users.root).toEqual({
      type: 'min',
      message: 'At least one user',
      ref: undefined,
    })
  })

  it('does not nest non-field-array errors under root', () => {
    const errors = {
      email: { type: 'required', message: 'Email is required' },
      password: { type: 'required', message: 'Password is required' },
    }
    const options = {
      fields: {},
      names: ['email', 'password'],
      shouldUseNativeValidation: false,
    }

    const result = toNestErrors(errors, options)

    expect(result.email).not.toHaveProperty('root')
    expect(result.password).not.toHaveProperty('root')
    expect(result.email).toEqual({
      type: 'required',
      message: 'Email is required',
      ref: undefined,
    })
  })

  it('uses options.names for field array detection when provided', () => {
    const errors = {
      items: { type: 'required', message: 'Items required' },
    }
    const options = {
      fields: {},
      names: ['items', 'items.0.name'],
      shouldUseNativeValidation: false,
    }

    const result = toNestErrors(errors, options)

    expect(result.items).toHaveProperty('root')
  })

  it('uses Object.keys(errors) for field array detection when options.names is not provided', () => {
    const errors = {
      items: { type: 'required', message: 'Items required' },
      'items.0': { type: 'required', message: 'Item 0 required' },
    }
    const options = {
      fields: {},
      shouldUseNativeValidation: false,
    }

    const result = toNestErrors(errors, options)

    expect(result.items).toHaveProperty('root')
  })

  it('calls validateFieldsNatively when shouldUseNativeValidation is true', () => {
    const errors = {
      email: { type: 'required', message: 'Email is required' },
    }
    const options = {
      fields: {},
      shouldUseNativeValidation: true,
    }

    toNestErrors(errors, options)

    expect(validateFieldsNatively).toHaveBeenCalledWith(errors, options)
    expect(validateFieldsNatively).toHaveBeenCalledTimes(1)
  })

  it('does not call validateFieldsNatively when shouldUseNativeValidation is false', () => {
    const errors = {
      email: { type: 'required', message: 'Email is required' },
    }
    const options = {
      fields: {},
      shouldUseNativeValidation: false,
    }

    toNestErrors(errors, options)

    expect(validateFieldsNatively).not.toHaveBeenCalled()
  })

  it('handles mixed field arrays and regular fields', () => {
    const errors = {
      email: { type: 'required', message: 'Email required' },
      items: { type: 'min', message: 'Items required' },
      password: { type: 'minLength', message: 'Too short' },
    }
    const options = {
      fields: {},
      names: ['email', 'items', 'items.0', 'password'],
      shouldUseNativeValidation: false,
    }

    const result = toNestErrors(errors, options) as {
      email: { type: string; message: string; ref: unknown }
      items: { root: { type: string; message: string; ref: unknown } }
      password: { type: string; message: string; ref: unknown }
    }

    expect(result.email).not.toHaveProperty('root')
    expect(result.items).toHaveProperty('root')
    expect(result.password).not.toHaveProperty('root')
    expect(result.email).toEqual({
      type: 'required',
      message: 'Email required',
      ref: undefined,
    })
    expect(result.items.root).toEqual({
      type: 'min',
      message: 'Items required',
      ref: undefined,
    })
  })

  it('handles deeply nested paths', () => {
    const errors = {
      'user.profile.address.street': {
        type: 'required',
        message: 'Street is required',
      },
      'user.profile.address.city': {
        type: 'required',
        message: 'City is required',
      },
    }
    const options = {
      fields: {},
      shouldUseNativeValidation: false,
    }

    const result = toNestErrors(errors, options) as {
      user: {
        profile: {
          address: {
            street: { type: string; message: string; ref: unknown }
            city: { type: string; message: string; ref: unknown }
          }
        }
      }
    }

    expect(result.user.profile.address.street).toEqual({
      type: 'required',
      message: 'Street is required',
      ref: undefined,
    })
    expect(result.user.profile.address.city).toEqual({
      type: 'required',
      message: 'City is required',
      ref: undefined,
    })
  })

  it('handles field array at nested path', () => {
    const errors = {
      'user.items': { type: 'required', message: 'Items required' },
    }
    const options = {
      fields: {},
      names: ['user.items', 'user.items.0', 'user.items.1'],
      shouldUseNativeValidation: false,
    }

    const result = toNestErrors(errors, options) as {
      user: {
        items: { root: { type: string; message: string; ref: unknown } }
      }
    }

    expect(result.user.items).toHaveProperty('root')
    expect(result.user.items.root).toEqual({
      type: 'required',
      message: 'Items required',
      ref: undefined,
    })
  })

  it('handles errors with additional properties', () => {
    const errors = {
      email: {
        type: 'custom',
        message: 'Custom error',
        types: { custom: 'Custom validation failed' },
      } as FieldError,
    }
    const options = {
      fields: {},
      shouldUseNativeValidation: false,
    }

    const result = toNestErrors(errors, options)

    expect(result.email).toEqual({
      type: 'custom',
      message: 'Custom error',
      types: { custom: 'Custom validation failed' },
      ref: undefined,
    })
  })

  it('preserves existing field array structure when adding root error', () => {
    const mockRef = { name: 'items', value: '' } as unknown as HTMLInputElement
    const errors = {
      items: { type: 'min', message: 'At least one item' },
    }
    const options = {
      fields: {
        items: {
          ref: mockRef,
          name: 'items',
        } as Field['_f'],
      },
      names: ['items', 'items.0', 'items.1'],
      shouldUseNativeValidation: false,
    }

    const result = toNestErrors(errors, options) as {
      items: { root: { type: string; message: string; ref: unknown } }
    }

    expect(result.items.root).toEqual({
      type: 'min',
      message: 'At least one item',
      ref: mockRef,
    })
  })

  it('handles complex scenario with nested paths, field arrays, and refs', () => {
    const emailRef = { name: 'email', value: '' } as unknown as HTMLInputElement
    const itemsRef = { name: 'items', value: '' } as unknown as HTMLInputElement
    const errors = {
      email: { type: 'email', message: 'Invalid email' },
      'user.profile.name': { type: 'required', message: 'Name required' },
      items: { type: 'min', message: 'At least one item' },
      tags: { type: 'required', message: 'Tags required' },
    }
    const options = {
      fields: {
        email: {
          ref: emailRef,
          name: 'email',
        } as Field['_f'],
        items: {
          ref: itemsRef,
          name: 'items',
        } as Field['_f'],
      },
      names: ['email', 'user.profile.name', 'items', 'items.0', 'tags'],
      shouldUseNativeValidation: false,
    }

    const result = toNestErrors(errors, options) as {
      email: { type: string; message: string; ref: unknown }
      user: {
        profile: {
          name: { type: string; message: string; ref: unknown }
        }
      }
      items: { root: { type: string; message: string; ref: unknown } }
      tags: { type: string; message: string; ref: unknown }
    }

    expect(result.email).toEqual({
      type: 'email',
      message: 'Invalid email',
      ref: emailRef,
    })
    expect(result.user.profile.name).toEqual({
      type: 'required',
      message: 'Name required',
      ref: undefined,
    })
    expect(result.items.root).toEqual({
      type: 'min',
      message: 'At least one item',
      ref: itemsRef,
    })
    expect(result.tags).toEqual({
      type: 'required',
      message: 'Tags required',
      ref: undefined,
    })
  })
})
