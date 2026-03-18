import { describe, expect, it } from 'vitest'
import { coerceValue } from './coerce-value'
import type { FieldDescriptor } from './types'

const boolean: FieldDescriptor = { type: 'boolean' }
const number: FieldDescriptor = { type: 'number' }
const date: FieldDescriptor = { type: 'date' }
const string: FieldDescriptor = { type: 'string' }
const enumField: FieldDescriptor = { type: 'enum' }

const allTypes: FieldDescriptor[] = [boolean, number, date, string, enumField]

describe('coerceValue', () => {
  it('behaves like identity when field is undefined', () => {
    expect(coerceValue(null)).toEqual(null)
    expect(coerceValue('some text')).toEqual('some text')
    expect(coerceValue(new File([], 'empty-file.txt'))).toBeInstanceOf(File)
  })

  it.each(allTypes)(
    'returns null when value is missing and field %j is nullable',
    (field) => {
      expect(coerceValue(null, { ...field, nullable: true })).toEqual(null)
    }
  )

  it.each(allTypes)(
    'returns null when value is missing and field %j is nullable and optional',
    (field) => {
      expect(
        coerceValue(null, { ...field, nullable: true, optional: true })
      ).toEqual(null)
    }
  )

  it.each(allTypes)(
    'returns undefined when value is missing and field %j is optional',
    (field) => {
      expect(coerceValue(null, { ...field, optional: true })).toEqual(undefined)
    }
  )

  it('returns NaN when trying to coerce things that do not make sense into numbers', () => {
    expect(coerceValue('not a number', number)).toEqual(Number.NaN)
    expect(coerceValue(new File([], 'empty-file.txt'), number)).toEqual(
      Number.NaN
    )
  })

  it('returns number when trying to coerce strings that can be read as numbers into numbers', () => {
    expect(coerceValue('0', number)).toEqual(0)
    expect(coerceValue('999999.999', number)).toEqual(999999.999)
  })

  it('coerces numbers to null when value is empty', () => {
    expect(coerceValue('', number)).toEqual(null)
    expect(coerceValue(null, number)).toEqual(null)
  })

  it('coerces booleans to true when value is not empty', () => {
    expect(coerceValue('not a boolean', boolean)).toEqual(true)
    expect(coerceValue('true', boolean)).toEqual(true)
    expect(coerceValue('on', boolean)).toEqual(true)
    expect(coerceValue(new File([], 'f'), boolean)).toEqual(true)
  })

  it("coerces booleans to false when value is 'false'", () => {
    expect(coerceValue('false', boolean)).toEqual(false)
  })

  it("coerces booleans to null when value is 'null'", () => {
    expect(coerceValue('null', boolean)).toEqual(null)
  })

  it('coerces booleans to false when value is empty', () => {
    expect(coerceValue('', boolean)).toEqual(false)
    expect(coerceValue(null, boolean)).toEqual(false)
  })

  it('coerces nullable booleans to true when value is not empty', () => {
    const field = { ...boolean, nullable: true }
    expect(coerceValue('not a boolean', field)).toEqual(true)
    expect(coerceValue('true', field)).toEqual(true)
    expect(coerceValue('on', field)).toEqual(true)
    expect(coerceValue(new File([], 'f'), field)).toEqual(true)
  })

  it("coerces nullable booleans to false when value is 'false'", () => {
    expect(coerceValue('false', { ...boolean, nullable: true })).toEqual(false)
  })

  it("coerces nullable booleans to null when value is 'null'", () => {
    expect(coerceValue('null', { ...boolean, nullable: true })).toEqual(null)
  })

  it('coerces nullable booleans to null when value is empty', () => {
    const field = { ...boolean, nullable: true }
    expect(coerceValue('', field)).toEqual(null)
    expect(coerceValue(null, field)).toEqual(null)
  })

  it('coerces dates to null when value is empty or is a file', () => {
    expect(coerceValue('', date)).toEqual(null)
    expect(coerceValue(null, date)).toEqual(null)
    expect(
      coerceValue(new File([], 'definitely-not-a-date.txt'), date)
    ).toEqual(null)
  })

  it('coerces dates to Invalid Date when value cannot be read as date', () => {
    expect(String(coerceValue('not a date', date))).toEqual('Invalid Date')
  })

  it('coerces dates to a valid Date when value can be read as date', () => {
    expect(coerceValue('2001-12-31', date)).toEqual(new Date(2001, 11, 31))
  })

  it('coerces strings to empty when value is empty', () => {
    expect(coerceValue('', string)).toEqual('')
    expect(coerceValue(null, string)).toEqual('')
  })

  it('coerces strings to [object File] when value is a file', () => {
    expect(coerceValue(new File([], 'some-empty-file.txt'), string)).toMatch(
      /\[object (File|Blob)\]/
    )
  })

  it('coerces enums to empty when value is empty', () => {
    expect(coerceValue('', enumField)).toEqual('')
    expect(coerceValue(null, enumField)).toEqual('')
  })

  it('coerces enums to [object File] when value is a file', () => {
    expect(coerceValue(new File([], 'some-empty-file.txt'), enumField)).toMatch(
      /\[object (File|Blob)\]/
    )
  })

  it('returns enum value when provided', () => {
    expect(coerceValue('one', enumField)).toBe('one')
  })

  it('returns value as-is for unknown type', () => {
    expect(coerceValue('hello', { type: null })).toBe('hello')
  })
})
