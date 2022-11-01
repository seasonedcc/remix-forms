import { describe, it, expect } from 'vitest'
import { inferLabel } from './inferLabel'

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
})
