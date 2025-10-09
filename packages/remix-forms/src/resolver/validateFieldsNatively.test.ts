import type { Field, ResolverOptions } from 'react-hook-form'
import { describe, expect, it, vi } from 'vitest'
import { validateFieldsNatively } from './validateFieldsNatively'

const createMockRef = () =>
  ({
    setCustomValidity: vi.fn(),
    reportValidity: vi.fn(),
  }) as unknown as HTMLInputElement

describe('validateFieldsNatively', () => {
  it('handles empty fields without errors', () => {
    const errors = {}
    const options = {
      fields: {},
      shouldUseNativeValidation: true,
    }

    expect(() => validateFieldsNatively(errors, options)).not.toThrow()
  })

  it('calls setCustomValidity and reportValidity on field with single ref and error', () => {
    const mockRef = createMockRef()
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
      shouldUseNativeValidation: true,
    }

    validateFieldsNatively(errors, options)

    expect(mockRef.setCustomValidity).toHaveBeenCalledWith('Email is required')
    expect(mockRef.reportValidity).toHaveBeenCalledTimes(1)
  })

  it('calls setCustomValidity with empty string when field has no error', () => {
    const mockRef = createMockRef()
    const errors = {}
    const options = {
      fields: {
        email: {
          ref: mockRef,
          name: 'email',
        } as Field['_f'],
      },
      shouldUseNativeValidation: true,
    }

    validateFieldsNatively(errors, options)

    expect(mockRef.setCustomValidity).toHaveBeenCalledWith('')
    expect(mockRef.reportValidity).toHaveBeenCalledTimes(1)
  })

  it('calls setCustomValidity and reportValidity on all refs in array with error', () => {
    const mockRef1 = createMockRef()
    const mockRef2 = createMockRef()
    const mockRef3 = createMockRef()
    const errors = {
      color: { type: 'required', message: 'Color is required' },
    }
    const options = {
      fields: {
        color: {
          refs: [mockRef1, mockRef2, mockRef3],
          name: 'color',
        } as Field['_f'],
      },
      shouldUseNativeValidation: true,
    }

    validateFieldsNatively(errors, options)

    expect(mockRef1.setCustomValidity).toHaveBeenCalledWith('Color is required')
    expect(mockRef1.reportValidity).toHaveBeenCalledTimes(1)
    expect(mockRef2.setCustomValidity).toHaveBeenCalledWith('Color is required')
    expect(mockRef2.reportValidity).toHaveBeenCalledTimes(1)
    expect(mockRef3.setCustomValidity).toHaveBeenCalledWith('Color is required')
    expect(mockRef3.reportValidity).toHaveBeenCalledTimes(1)
  })

  it('calls setCustomValidity with empty string on all refs when no error', () => {
    const mockRef1 = createMockRef()
    const mockRef2 = createMockRef()
    const errors = {}
    const options = {
      fields: {
        color: {
          refs: [mockRef1, mockRef2],
          name: 'color',
        } as Field['_f'],
      },
      shouldUseNativeValidation: true,
    }

    validateFieldsNatively(errors, options)

    expect(mockRef1.setCustomValidity).toHaveBeenCalledWith('')
    expect(mockRef1.reportValidity).toHaveBeenCalledTimes(1)
    expect(mockRef2.setCustomValidity).toHaveBeenCalledWith('')
    expect(mockRef2.reportValidity).toHaveBeenCalledTimes(1)
  })

  it('skips field when ref does not have reportValidity', () => {
    const mockRef = {
      setCustomValidity: vi.fn(),
    } as unknown as HTMLInputElement
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
      shouldUseNativeValidation: true,
    }

    validateFieldsNatively(errors, options)

    expect(mockRef.setCustomValidity).not.toHaveBeenCalled()
  })

  it('handles field without ref or refs property', () => {
    const errors = {
      email: { type: 'required', message: 'Email is required' },
    }
    const options = {
      fields: {
        email: {
          name: 'email',
        } as Field['_f'],
      },
      shouldUseNativeValidation: true,
    }

    expect(() => validateFieldsNatively(errors, options)).not.toThrow()
  })

  it('handles falsy ref gracefully', () => {
    const errors = {
      email: { type: 'required', message: 'Email is required' },
    }
    const options = {
      fields: {
        email: {
          ref: null,
          name: 'email',
        } as unknown as Field['_f'],
      },
      shouldUseNativeValidation: true,
    }

    expect(() => validateFieldsNatively(errors, options)).not.toThrow()
  })

  it('handles multiple fields with mixed scenarios', () => {
    const emailRef = createMockRef()
    const passwordRef = createMockRef()
    const colorRef1 = createMockRef()
    const colorRef2 = createMockRef()
    const errors = {
      email: { type: 'email', message: 'Invalid email' },
      password: { type: 'required', message: 'Password is required' },
    }
    const options = {
      fields: {
        email: {
          ref: emailRef,
          name: 'email',
        } as Field['_f'],
        password: {
          ref: passwordRef,
          name: 'password',
        } as Field['_f'],
        username: {
          name: 'username',
        } as Field['_f'],
        color: {
          refs: [colorRef1, colorRef2],
          name: 'color',
        } as Field['_f'],
      },
      shouldUseNativeValidation: true,
    }

    validateFieldsNatively(errors, options)

    expect(emailRef.setCustomValidity).toHaveBeenCalledWith('Invalid email')
    expect(emailRef.reportValidity).toHaveBeenCalledTimes(1)
    expect(passwordRef.setCustomValidity).toHaveBeenCalledWith(
      'Password is required'
    )
    expect(passwordRef.reportValidity).toHaveBeenCalledTimes(1)
    expect(colorRef1.setCustomValidity).toHaveBeenCalledWith('')
    expect(colorRef1.reportValidity).toHaveBeenCalledTimes(1)
    expect(colorRef2.setCustomValidity).toHaveBeenCalledWith('')
    expect(colorRef2.reportValidity).toHaveBeenCalledTimes(1)
  })

  it('retrieves nested field path errors correctly', () => {
    const mockRef = createMockRef()
    const errors = {
      user: {
        email: { type: 'email', message: 'Invalid email format' },
      },
    }
    const options = {
      fields: {
        'user.email': {
          ref: mockRef,
          name: 'user.email',
        } as Field['_f'],
      },
      shouldUseNativeValidation: true,
    }

    validateFieldsNatively(errors, options)

    expect(mockRef.setCustomValidity).toHaveBeenCalledWith(
      'Invalid email format'
    )
    expect(mockRef.reportValidity).toHaveBeenCalledTimes(1)
  })

  it('handles deeply nested field path errors', () => {
    const mockRef = createMockRef()
    const errors = {
      user: {
        profile: {
          address: {
            street: { type: 'required', message: 'Street is required' },
          },
        },
      },
    }
    const options = {
      fields: {
        'user.profile.address.street': {
          ref: mockRef,
          name: 'user.profile.address.street',
        } as Field['_f'],
      },
      shouldUseNativeValidation: true,
    }

    validateFieldsNatively(errors, options)

    expect(mockRef.setCustomValidity).toHaveBeenCalledWith('Street is required')
    expect(mockRef.reportValidity).toHaveBeenCalledTimes(1)
  })

  it('calls reportValidity after setCustomValidity', () => {
    const callOrder: string[] = []
    const mockRef = {
      setCustomValidity: vi.fn(() => callOrder.push('setCustomValidity')),
      reportValidity: vi.fn(() => callOrder.push('reportValidity')),
    } as unknown as HTMLInputElement
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
      shouldUseNativeValidation: true,
    }

    validateFieldsNatively(errors, options)

    expect(callOrder).toEqual(['setCustomValidity', 'reportValidity'])
  })

  it('handles field with error but no message property', () => {
    const mockRef = createMockRef()
    const errors = {
      email: { type: 'required' },
    }
    const options = {
      fields: {
        email: {
          ref: mockRef,
          name: 'email',
        } as Field['_f'],
      },
      shouldUseNativeValidation: true,
    }

    validateFieldsNatively(errors, options)

    expect(mockRef.setCustomValidity).toHaveBeenCalledWith('')
    expect(mockRef.reportValidity).toHaveBeenCalledTimes(1)
  })

  it('handles array field path errors', () => {
    const mockRef = createMockRef()
    const errors = {
      'items.0.name': { type: 'required', message: 'Item name is required' },
    }
    const options = {
      fields: {
        'items.0.name': {
          ref: mockRef,
          name: 'items.0.name',
        } as Field['_f'],
      },
      shouldUseNativeValidation: true,
    }

    validateFieldsNatively(errors, options)

    expect(mockRef.setCustomValidity).toHaveBeenCalledWith(
      'Item name is required'
    )
    expect(mockRef.reportValidity).toHaveBeenCalledTimes(1)
  })

  it('handles refs array with single element', () => {
    const mockRef = createMockRef()
    const errors = {
      agree: { type: 'required', message: 'You must agree' },
    }
    const options = {
      fields: {
        agree: {
          refs: [mockRef],
          name: 'agree',
        } as Field['_f'],
      },
      shouldUseNativeValidation: true,
    }

    validateFieldsNatively(errors, options)

    expect(mockRef.setCustomValidity).toHaveBeenCalledWith('You must agree')
    expect(mockRef.reportValidity).toHaveBeenCalledTimes(1)
  })

  it('handles empty refs array', () => {
    const errors = {
      color: { type: 'required', message: 'Color is required' },
    }
    const options = {
      fields: {
        color: {
          refs: [],
          name: 'color',
        } as unknown as Field['_f'],
      },
      shouldUseNativeValidation: true,
    }

    expect(() => validateFieldsNatively(errors, options)).not.toThrow()
  })

  it('handles field with both ref and refs properties preferring ref', () => {
    const mockRef = createMockRef()
    const mockRefs = [createMockRef(), createMockRef()]
    const errors = {
      field: { type: 'required', message: 'Field is required' },
    }
    const options = {
      fields: {
        field: {
          ref: mockRef,
          refs: mockRefs,
          name: 'field',
        } as unknown as Field['_f'],
      },
      shouldUseNativeValidation: true,
    }

    validateFieldsNatively(errors, options)

    expect(mockRef.setCustomValidity).toHaveBeenCalledWith('Field is required')
    expect(mockRef.reportValidity).toHaveBeenCalledTimes(1)
    expect(mockRefs[0].setCustomValidity).not.toHaveBeenCalled()
    expect(mockRefs[1].setCustomValidity).not.toHaveBeenCalled()
  })

  it('processes all fields even when some have invalid refs', () => {
    const validRef = createMockRef()
    const invalidRef = {
      setCustomValidity: vi.fn(),
    } as unknown as HTMLInputElement
    const errors = {
      valid: { type: 'required', message: 'Valid field error' },
      invalid: { type: 'required', message: 'Invalid field error' },
    }
    const options = {
      fields: {
        valid: {
          ref: validRef,
          name: 'valid',
        } as Field['_f'],
        invalid: {
          ref: invalidRef,
          name: 'invalid',
        } as Field['_f'],
      },
      shouldUseNativeValidation: true,
    }

    validateFieldsNatively(errors, options)

    expect(validRef.setCustomValidity).toHaveBeenCalledWith('Valid field error')
    expect(validRef.reportValidity).toHaveBeenCalledTimes(1)
    expect(invalidRef.setCustomValidity).not.toHaveBeenCalled()
  })

  it('works with different ResolverOptions types', () => {
    const mockRef = createMockRef()
    const errors = {
      email: { type: 'required', message: 'Email is required' },
    }
    const options: ResolverOptions<{ email: string }> = {
      fields: {
        email: {
          ref: mockRef,
          name: 'email',
        } as Field['_f'],
      },
      shouldUseNativeValidation: true,
    }

    validateFieldsNatively(errors, options)

    expect(mockRef.setCustomValidity).toHaveBeenCalledWith('Email is required')
    expect(mockRef.reportValidity).toHaveBeenCalledTimes(1)
  })

  it('handles complex nested object with multiple error levels', () => {
    const ref1 = createMockRef()
    const ref2 = createMockRef()
    const ref3 = createMockRef()
    const errors = {
      user: {
        profile: {
          firstName: { type: 'required', message: 'First name required' },
        },
        contact: {
          email: { type: 'email', message: 'Invalid email' },
        },
      },
      settings: {
        theme: { type: 'required', message: 'Theme required' },
      },
    }
    const options = {
      fields: {
        'user.profile.firstName': {
          ref: ref1,
          name: 'user.profile.firstName',
        } as Field['_f'],
        'user.contact.email': {
          ref: ref2,
          name: 'user.contact.email',
        } as Field['_f'],
        'settings.theme': {
          ref: ref3,
          name: 'settings.theme',
        } as Field['_f'],
      },
      shouldUseNativeValidation: true,
    }

    validateFieldsNatively(errors, options)

    expect(ref1.setCustomValidity).toHaveBeenCalledWith('First name required')
    expect(ref1.reportValidity).toHaveBeenCalledTimes(1)
    expect(ref2.setCustomValidity).toHaveBeenCalledWith('Invalid email')
    expect(ref2.reportValidity).toHaveBeenCalledTimes(1)
    expect(ref3.setCustomValidity).toHaveBeenCalledWith('Theme required')
    expect(ref3.reportValidity).toHaveBeenCalledTimes(1)
  })
})
