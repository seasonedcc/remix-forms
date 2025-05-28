import { describe, expect, it } from 'vitest'
import * as z from 'zod'
import { zod3Adapter } from './adapters/zod3'
import { coerceToForm } from './coerce-to-form'

describe('coerceToForm', () => {
  it('handles boolean values', () => {
    const shape = zod3Adapter.getFieldInfo(z.boolean())
    expect(coerceToForm(true, shape)).toBe(true)
    expect(coerceToForm('', shape)).toBe(false)
  })

  it('formats dates as YYYY-MM-DD strings', () => {
    const shape = zod3Adapter.getFieldInfo(z.date())
    const date = new Date('2024-05-06T12:00:00Z')
    expect(coerceToForm(date, shape)).toBe('2024-05-06')
    expect(coerceToForm(undefined, shape)).toBeUndefined()
  })

  it('casts strings, numbers and enums to strings', () => {
    expect(coerceToForm('foo', zod3Adapter.getFieldInfo(z.string()))).toBe(
      'foo'
    )
    expect(coerceToForm(undefined, zod3Adapter.getFieldInfo(z.string()))).toBe(
      ''
    )
    expect(coerceToForm(5, zod3Adapter.getFieldInfo(z.number()))).toBe('5')
    const enumShape = zod3Adapter.getFieldInfo(z.enum(['a', 'b']))
    expect(coerceToForm('a', enumShape)).toBe('a')
  })

  it('returns the value or empty string for unknown shapes', () => {
    const objectShape = zod3Adapter.getFieldInfo(z.object({}))
    expect(coerceToForm('hello', objectShape)).toBe('hello')
    expect(coerceToForm(undefined, zod3Adapter.getFieldInfo())).toBe('')
  })
})
