import { describe, it, expect } from 'vitest'
import inferLabel from './inferLabel'

describe('inferLabel', () => {
  it('capitalizes the field name', () => {
    expect(inferLabel('fooBar')).toEqual('Foo Bar')
  })

  it('does not capitalize "URL"', () => {
    expect(inferLabel('fooBarUrl')).toEqual('Foo Bar URL')
  })
})
