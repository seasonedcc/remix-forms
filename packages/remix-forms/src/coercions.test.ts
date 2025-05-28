import { describe, expect, it } from 'vitest'
import * as z from 'zod'
import { zod3Adapter } from './adapters/zod3'
import { coerceValue } from './coercions'

const supportedShapes = [
  z.boolean(),
  z.number(),
  z.date(),
  z.string(),
  z.enum(['one', 'two']),
]

describe('coerceValue', () => {
  it('behaves like identity when shape is undefined', () => {
    expect(coerceValue(null, undefined, zod3Adapter)).toEqual(null)
    expect(coerceValue('some text', undefined, zod3Adapter)).toEqual(
      'some text'
    )
    expect(
      coerceValue(new File([], 'empty-file.txt'), undefined, zod3Adapter)
    ).toBeInstanceOf(File)
  })

  it.each(supportedShapes)(
    'returns null when value is missing and shape %s is nullable',
    (shape) => {
      expect(coerceValue(null, shape.nullable(), zod3Adapter)).toEqual(null)
    }
  )

  it.each(supportedShapes)(
    'returns null when value is missing and shape %s is nullable and optional',
    (shape) => {
      expect(
        coerceValue(null, shape.nullable().optional(), zod3Adapter)
      ).toEqual(null)
    }
  )

  it.each(supportedShapes)(
    'returns undefined when value is missing and shape %s is optional',
    (shape) => {
      expect(coerceValue(null, shape.optional(), zod3Adapter)).toEqual(
        undefined
      )
    }
  )

  it('returns NaN when trying to coerce things that do not make sense into numbers', () => {
    expect(coerceValue('not a number', z.number(), zod3Adapter)).toEqual(
      Number.NaN
    )
    expect(
      coerceValue(new File([], 'empty-file.txt'), z.number(), zod3Adapter)
    ).toEqual(Number.NaN)
  })

  it('returns number when trying to coerce strings that can be read as numbers into numbers', () => {
    expect(coerceValue('0', z.number(), zod3Adapter)).toEqual(0)
    expect(coerceValue('999999.999', z.number(), zod3Adapter)).toEqual(
      999999.999
    )
  })

  it('coerces numbers to null when value is empty', () => {
    expect(coerceValue('', z.number(), zod3Adapter)).toEqual(null)
    expect(coerceValue(null, z.number(), zod3Adapter)).toEqual(null)
  })

  it('coerces booleans to true when value is not empty', () => {
    expect(coerceValue('not a boolean', z.boolean(), zod3Adapter)).toEqual(true)
    expect(coerceValue('false', z.boolean(), zod3Adapter)).toEqual(true)
    expect(coerceValue('true', z.boolean(), zod3Adapter)).toEqual(true)
    expect(coerceValue(new File([], 'f'), z.boolean(), zod3Adapter)).toEqual(
      true
    )
  })

  it('coerces booleans to false when value is empty', () => {
    expect(coerceValue('', z.boolean(), zod3Adapter)).toEqual(false)
    expect(coerceValue(null, z.boolean(), zod3Adapter)).toEqual(false)
  })

  it('coerces dates to null when value is empty or is a file', () => {
    expect(coerceValue('', z.date(), zod3Adapter)).toEqual(null)
    expect(coerceValue(null, z.date(), zod3Adapter)).toEqual(null)
    expect(
      coerceValue(
        new File([], 'definitely-not-a-date.txt'),
        z.date(),
        zod3Adapter
      )
    ).toEqual(null)
  })

  it('coerces dates to Invalid Date when value cannot be read as date', () => {
    expect(String(coerceValue('not a date', z.date(), zod3Adapter))).toEqual(
      'Invalid Date'
    )
  })

  it('coerces dates to a valid Date when value can be read as date', () => {
    expect(coerceValue('2001-12-31', z.date(), zod3Adapter)).toEqual(
      new Date(2001, 11, 31)
    )
  })

  it('coerces strings to empty when value is empty', () => {
    expect(coerceValue('', z.string(), zod3Adapter)).toEqual('')
    expect(coerceValue(null, z.string(), zod3Adapter)).toEqual('')
  })

  it('coerces strings to [object File] when value is a file', () => {
    expect(
      coerceValue(new File([], 'some-empty-file.txt'), z.string(), zod3Adapter)
    ).toMatch(/[object (File|Blob)]/)
  })

  it('coerces enums to empty when value is empty', () => {
    expect(coerceValue('', z.enum(['test']), zod3Adapter)).toEqual('')
    expect(coerceValue(null, z.enum(['test']), zod3Adapter)).toEqual('')
  })

  it('coerces enums to [object File] when value is a file', () => {
    expect(
      coerceValue(
        new File([], 'some-empty-file.txt'),
        z.enum(['test']),
        zod3Adapter
      )
    ).toMatch(/[object (File|Blob)]/)
  })

  it('returns enum value when provided', () => {
    expect(coerceValue('one', z.enum(['one', 'two']), zod3Adapter)).toBe('one')
  })
})
