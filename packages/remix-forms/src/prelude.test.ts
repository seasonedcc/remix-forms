import { afterEach, describe, expect, it } from 'vitest'
import * as z from 'zod'
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

  it('extracts object from schema with transform', () => {
    const inner = z.object({ count: z.number() })
    const schema = inner.transform((v) => ({ ...v, doubled: v.count * 2 }))
    expect(objectFromSchema(schema)).toBe(inner)
  })

  it('extracts object from schema with chained transforms', () => {
    const inner = z.object({ value: z.string() })
    const schema = inner
      .transform((v) => ({ ...v, upper: v.value.toUpperCase() }))
      .transform((v) => ({ ...v, length: v.upper.length }))
    expect(objectFromSchema(schema)).toBe(inner)
  })

  it('handles nested preprocess (preprocess wrapping preprocess)', () => {
    const inner = z.object({ nested: z.boolean() })
    const preprocessed = z.preprocess((v) => v, inner)
    const schema = z.preprocess((v) => v, preprocessed)
    expect(objectFromSchema(schema)).toBe(inner)
  })

  it('extracts object from deeply nested preprocessing', () => {
    const inner = z.object({ deep: z.string() })
    const schema = z.preprocess(
      (v) => v,
      z.preprocess(
        (v) => v,
        z.preprocess((v) => v, inner)
      )
    )
    expect(objectFromSchema(schema)).toBe(inner)
  })

  it('throws error for invalid schema without _zod.def', () => {
    const invalidSchema = { notAZodSchema: true }
    // biome-ignore lint/suspicious/noExplicitAny: Testing error handling with invalid schema
    expect(() => objectFromSchema(invalidSchema as any)).toThrow(
      'Invalid schema: missing _zod.def'
    )
  })

  it('throws error for unknown schema type', () => {
    const unknownSchema = {
      _zod: {
        def: {
          type: 'unknownType',
        },
      },
    }
    // biome-ignore lint/suspicious/noExplicitAny: Testing error handling with unknown schema type
    expect(() => objectFromSchema(unknownSchema as any)).toThrow(
      'Cannot extract object schema from type: unknownType'
    )
  })

  it('handles complex nested object schemas', () => {
    const inner = z.object({
      user: z.object({
        name: z.string(),
        profile: z.object({
          age: z.number(),
        }),
      }),
    })
    const schema = z.preprocess((v) => v, inner)
    expect(objectFromSchema(schema)).toBe(inner)
  })

  it('extracts object from explicit pipe usage', () => {
    const inner = z.object({ value: z.number() })
    const schema = inner.pipe(
      z.object({ value: z.number(), extra: z.string() })
    )
    expect(objectFromSchema(schema)).toBe(inner)
  })

  it('handles mixed transform and preprocess', () => {
    const inner = z.object({ data: z.string() })
    const transformed = inner.transform((v) => ({ ...v, transformed: true }))
    const schema = z.preprocess((v) => v, transformed)
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
