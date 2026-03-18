import { describe, expect, it } from 'vitest'
import { coerceToForm } from './coerce-to-form'
import type { FieldDescriptor } from './types'

describe('coerceToForm', () => {
  it('handles boolean values', () => {
    const field: FieldDescriptor = { type: 'boolean' }
    expect(coerceToForm(true, field)).toBe(true)
    expect(coerceToForm('', field)).toBe(false)
  })

  it('formats dates as YYYY-MM-DD strings', () => {
    const field: FieldDescriptor = { type: 'date' }
    const date = new Date('2024-05-06T12:00:00Z')
    expect(coerceToForm(date, field)).toBe('2024-05-06')
    expect(coerceToForm(undefined, field)).toBeUndefined()
  })

  it('casts strings, numbers and enums to strings', () => {
    expect(coerceToForm('foo', { type: 'string' })).toBe('foo')
    expect(coerceToForm(undefined, { type: 'string' })).toBe('')
    expect(coerceToForm(5, { type: 'number' })).toBe('5')
    expect(coerceToForm('a', { type: 'enum' })).toBe('a')
  })

  it('returns the value or empty string for unknown type', () => {
    expect(coerceToForm('hello', { type: null })).toBe('hello')
    expect(coerceToForm(undefined, { type: null })).toBe('')
  })
})
