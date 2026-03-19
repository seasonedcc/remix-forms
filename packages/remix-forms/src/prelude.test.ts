import { afterEach, describe, expect, it } from 'vitest'
import { browser, mapObject } from './prelude'

describe('mapObject', () => {
  it('maps each key/value pair using the provided function', () => {
    const obj: Record<string, number> = { a: 1, b: 2 }
    const result = mapObject<Record<string, number>, number, number>(
      obj,
      (key, value) => [key + key, value * 2]
    )
    expect(result).toEqual({ aa: 2, bb: 4 })
  })
})

describe('browser', () => {
  const original = globalThis.document
  afterEach(() => {
    // restore original document
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    ;(globalThis as any).document = original
  })

  it('returns false when document is undefined', () => {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    ;(globalThis as any).document = undefined
    expect(browser()).toBe(false)
  })

  it('returns true when document is defined', () => {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    ;(globalThis as any).document = {}
    expect(browser()).toBe(true)
  })
})
