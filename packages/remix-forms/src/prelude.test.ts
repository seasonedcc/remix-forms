import { afterEach, describe, expect, it } from 'vitest'
import { browser, mapObject } from './prelude'

describe('mapObject', () => {
  it('maps each key/value pair using the provided function', () => {
    const obj: Record<string, number> = { a: 1, b: 2 }
    const result = mapObject<number, number>(obj, (key, value) => [
      key + key,
      value * 2,
    ])
    expect(result).toEqual({ aa: 2, bb: 4 })
  })
})

describe('browser', () => {
  const original = globalThis.document
  afterEach(() => {
    Object.defineProperty(globalThis, 'document', {
      value: original,
      writable: true,
      configurable: true,
    })
  })

  it('returns false when document is undefined', () => {
    Object.defineProperty(globalThis, 'document', {
      value: undefined,
      writable: true,
      configurable: true,
    })
    expect(browser()).toBe(false)
  })

  it('returns true when document is defined', () => {
    Object.defineProperty(globalThis, 'document', {
      value: {},
      writable: true,
      configurable: true,
    })
    expect(browser()).toBe(true)
  })
})
