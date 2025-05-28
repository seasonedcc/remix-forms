import { afterEach, describe, expect, it } from 'vitest'
import * as z from 'zod/v4'
import { browser, mapObject, objectFromSchema, parseDate } from './prelude'

describe('objectFromSchema', () => {
  it('returns the object when given a Zod object', () => {
    const schema = z.object({ name: z.string() })
    expect(objectFromSchema(schema)).toBe(schema)
  })

  it('unwraps Zod effects to return the inner object', () => {
    const inner = z.object({ age: z.number() })
    const schema = z.preprocess((v) => v, inner)
    expect(objectFromSchema(schema)).toBe(inner)
  })

  it('unwraps Zod pipelines to return the inner object', () => {
    const inner = z.object({ done: z.boolean() })
    const schema = z.object({}).pipe(inner)
    expect(objectFromSchema(schema)).toBe(inner)
  })
})

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

describe('parseDate', () => {
  it('returns undefined when value is falsy', () => {
    expect(parseDate()).toBeUndefined()
  })

  it('formats Date instances as YYYY-MM-DD strings', () => {
    const date = new Date('2024-01-02T10:20:30Z')
    expect(parseDate(date)).toBe('2024-01-02')
  })

  it('passes through date strings unchanged', () => {
    expect(parseDate('2024-05-06T07:08:09Z')).toBe('2024-05-06')
  })

  it('keeps YYYY-MM-DD strings as is', () => {
    expect(parseDate('2024-05-06')).toBe('2024-05-06')
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
