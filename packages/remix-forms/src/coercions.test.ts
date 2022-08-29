import { describe, it, expect } from 'vitest'
import * as z from 'zod'
import { coerceValue } from './coercions'

const supportedShapes = [
  z.boolean(),
  z.number(),
  z.date(),
  z.string(),
  z.enum(['one', 'two']),
  z.array(z.string()),
  z.array(z.number()),
]

describe('coerceValue', () => {
  it('behaves like identity when shape is undefined', () => {
    expect(coerceValue(null)).toEqual(null)
    expect(coerceValue('some text')).toEqual('some text')
    expect(coerceValue(new File([], 'empty-file.txt'))).toBeInstanceOf(File)
  })

  it.each(supportedShapes)(
    'returns null when value is missing and shape %s is nullable',
    (shape) => {
      expect(coerceValue(null, shape.nullable())).toEqual(null)
    },
  )

  it.each(supportedShapes)(
    'returns null when value is missing and shape %s is nullable and optional',
    (shape) => {
      expect(coerceValue(null, shape.nullable().optional())).toEqual(null)
    },
  )

  it.each(supportedShapes)(
    'returns undefined when value is missing and shape %s is optional',
    (shape) => {
      expect(coerceValue(null, shape.optional())).toEqual(undefined)
    },
  )

  it('returns NaN when trying to coerce things that do not make sense into numbers', () => {
    expect(coerceValue('not a number', z.number())).toEqual(NaN)
    expect(coerceValue(new File([], 'empty-file.txt'), z.number())).toEqual(NaN)
  })

  it('returns number when trying to coerce strings that can be read as numbers into numbers', () => {
    expect(coerceValue('0', z.number())).toEqual(0)
    expect(coerceValue('999999.999', z.number())).toEqual(999999.999)
  })

  it('coerces numbers to null when value is empty', () => {
    expect(coerceValue('', z.number())).toEqual(null)
    expect(coerceValue(null, z.number())).toEqual(null)
  })

  it('coerces booleans to true when value is not empty', () => {
    expect(coerceValue('not a boolean', z.boolean())).toEqual(true)
    expect(coerceValue('false', z.boolean())).toEqual(true)
    expect(coerceValue('true', z.boolean())).toEqual(true)
  })

  it('coerces booleans to false when value is empty', () => {
    expect(coerceValue('', z.boolean())).toEqual(false)
    expect(coerceValue(null, z.boolean())).toEqual(false)
  })

  it('coerces dates to null when value is empty or is a file', () => {
    expect(coerceValue('', z.date())).toEqual(null)
    expect(coerceValue(null, z.date())).toEqual(null)
    expect(
      coerceValue(new File([], 'definitely-not-a-date.txt'), z.date()),
    ).toEqual(null)
  })

  it('coerces dates to Invalid Date when value cannot be read as date', () => {
    expect(String(coerceValue('not a date', z.date()))).toEqual('Invalid Date')
  })

  it('coerces dates to a valid Date when value can be read as date', () => {
    expect(coerceValue('2001-12-31', z.date())).toEqual(new Date(2001, 11, 31))
  })

  it('coerces strings to empty when value is empty', () => {
    expect(coerceValue('', z.string())).toEqual('')
    expect(coerceValue(null, z.string())).toEqual('')
  })

  it('coerces strings to [object Blob] when value is a file', () => {
    expect(
      coerceValue(new File([], 'some-empty-file.txt'), z.string()),
    ).toEqual('[object Blob]')
  })

  it('coerces enums to empty when value is empty', () => {
    expect(coerceValue('', z.enum(['test']))).toEqual('')
    expect(coerceValue(null, z.enum(['test']))).toEqual('')
  })

  it('coerces enums to [object Blob] when value is a file', () => {
    expect(
      coerceValue(new File([], 'some-empty-file.txt'), z.enum(['test'])),
    ).toEqual('[object Blob]')
  })

  it('coerces array of strings to empty array when value is empty', () => {
    expect(
      coerceValue('', z.array(z.string())),
    ).toEqual([])
  })

  it('coerces array of numbers to empty array when value is empty', () => {
    expect(
      coerceValue('', z.array(z.number())),
    ).toEqual([])
  })

  it('coerces array of strings to array when value is not empty', () => {
    expect(
      coerceValue('a,b,c', z.array(z.string())),
    ).toEqual(['a','b','c'])
  })

  it('coerces array of strings to array and removes empty elements', () => {
    expect(
      coerceValue('a,b,c,,,,,,d,,,,e', z.array(z.string())),
    ).toEqual(['a','b','c','d','e'])
  })

  it('coerces array of strings to array without trimming whitespaces', () => {
    expect(
      coerceValue('a , b , c', z.array(z.string())),
    ).toEqual(['a ',' b ',' c'])
  })

  it('coerces array of strings to [object Blob] when value is a file', () => {
    expect(
      coerceValue(new File([], 'some-empty-file.txt'), z.array(z.string())),
    ).toEqual(['[object Blob]'])
  })

  it('coerces array of numbers to array when value is not empty', () => {
    expect(
      coerceValue('1,2,3', z.array(z.number())),
    ).toEqual([1,2,3])
  })

  it('coerces array of numbers to array and removes empty elements', () => {
    expect(
      coerceValue('1,2,3,,,,,,4,,,,5', z.array(z.number())),
    ).toEqual([1,2,3,4,5])
  })

  it('coerces array of numbers to array when value is not empty and removes values that can not be coerced to numbers', () => {
    expect(
      coerceValue('1,a,§,:,;,?,2', z.array(z.number())),
    ).toEqual([1,2])
  })

  it('coerces array of numbers to [object Blob] when value is a file', () => {
    expect(
      coerceValue(new File([], 'some-empty-file.txt'), z.array(z.number())),
    ).toEqual(['[object Blob]'])
  })
})
