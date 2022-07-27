import { describe, it, expect } from 'vitest'
import { startCase } from './startCase'

describe('startCase', () => {
  it('capitalizes the first letter of every word', () => {
    const strings = [
      'some_field_name',
      'Some field that needs to be title-cased',
      'some-field-name',
      'some-mixed_string with spaces_underscores-and-hyphens',
    ]
    expect(strings.map(startCase)).toEqual([
      'Some Field Name',
      'Some Field That Needs To Be Title Cased',
      'Some Field Name',
      'Some Mixed String With Spaces Underscores And Hyphens',
    ])
  })
})
