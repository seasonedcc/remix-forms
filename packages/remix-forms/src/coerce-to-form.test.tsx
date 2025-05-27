import { describe, expect, it } from 'vitest'
import * as z from 'zod/v4'
import { coerceToForm } from './schema-form'
import { shapeInfo } from './shape-info'

describe('coerceToForm', () => {
  it('handles boolean values', () => {
    const shape = shapeInfo(z.boolean())
    expect(coerceToForm(true, shape)).toBe(true)
    expect(coerceToForm('', shape)).toBe(false)
  })

  it('formats dates as YYYY-MM-DD strings', () => {
    const shape = shapeInfo(z.date())
    const date = new Date('2024-05-06T12:00:00Z')
    expect(coerceToForm(date, shape)).toBe('2024-05-06')
    expect(coerceToForm(undefined, shape)).toBeUndefined()
  })

  it('casts strings, numbers and enums to strings', () => {
    expect(coerceToForm('foo', shapeInfo(z.string()))).toBe('foo')
    expect(coerceToForm(undefined, shapeInfo(z.string()))).toBe('')
    expect(coerceToForm(5, shapeInfo(z.number()))).toBe('5')
    const enumShape = shapeInfo(z.enum(['a', 'b']))
    expect(coerceToForm('a', enumShape)).toBe('a')
  })

  it('returns the value or empty string for unknown shapes', () => {
    const objectShape = shapeInfo(z.object({}))
    expect(coerceToForm('hello', objectShape)).toBe('hello')
    expect(coerceToForm(undefined, shapeInfo())).toBe('')
  })
})
