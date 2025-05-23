import { describe, expect, it } from 'vitest'
import { inferLabel, startCase } from './infer-label'

describe('inferLabel', () => {
  it('capitalizes the field name', () => {
    expect(inferLabel('fooBar')).toEqual('Foo Bar')
  })

  it('does not capitalize "URL"', () => {
    expect(inferLabel('fooBarUrl')).toEqual('Foo Bar URL')
  })

  it('capitalizes the first letter of every word', () => {
    const strings = [
      'some_field_name',
      'Some field that needs to be title-cased',
      'some-field-name',
      'some-mixed_string with spaces_underscores-and-hyphens',
    ]
    expect(strings.map(inferLabel)).toEqual([
      'Some Field Name',
      'Some Field That Needs To Be Title Cased',
      'Some Field Name',
      'Some Mixed String With Spaces Underscores And Hyphens',
    ])
  })

  it('keeps numbers as part of the name', () => {
    expect(inferLabel('field1Name')).toBe('Field1 Name')
  })

  it('keeps accents when inferring labels', () => {
    expect(inferLabel('avião')).toBe('Avião')
    expect(inferLabel('ônibus')).toBe('Ônibus')
  })
})

describe('startCase', () => {
  it('handles camelCase with acronyms and numbers', () => {
    expect(startCase('fooBarHTML42')).toBe('Foo Bar HTML 42')
  })

  it('handles words with apostrophes', () => {
    expect(startCase("rock'n'roll")).toBe("Rock'n'Roll")
  })

  it('handles multiple apostrophes in camelCase', () => {
    expect(startCase("can'tStopWon'tStop")).toBe("Can't Stop Won't Stop")
  })

  it('handles trailing numbers', () => {
    expect(startCase('item42')).toBe('Item42')
  })

  it('splits camel cased acronyms', () => {
    expect(startCase('XMLHttpRequest')).toBe('XML Http Request')
  })

  it('handles a leading apostrophe', () => {
    expect(startCase("'tisTheSeason")).toBe("'Tis The Season")
  })
})
