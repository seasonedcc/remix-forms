import { describe, expect, it } from 'vitest'
import * as z from 'zod'
import { zod3Adapter } from './adapters/zod3'

describe('zod3Adapter.getFieldInfo', () => {
  it('returns null type when shape is undefined', () => {
    expect(zod3Adapter.getFieldInfo()).toEqual({
      typeName: null,
      optional: false,
      nullable: false,
      getDefaultValue: undefined,
      enumValues: undefined,
    })
  })

  it('extracts info from primitive shapes', () => {
    expect(zod3Adapter.getFieldInfo(z.string())).toEqual({
      typeName: 'ZodString',
      optional: false,
      nullable: false,
      getDefaultValue: undefined,
      enumValues: undefined,
    })
  })

  it('marks optional and nullable shapes correctly', () => {
    const info = zod3Adapter.getFieldInfo(z.number().optional().nullable())
    expect(info).toEqual({
      typeName: 'ZodNumber',
      optional: true,
      nullable: true,
      getDefaultValue: undefined,
      enumValues: undefined,
    })
  })

  it('collects default value getter', () => {
    const info = zod3Adapter.getFieldInfo(z.string().default('foo'))
    expect(info.typeName).toBe('ZodString')
    expect(typeof info.getDefaultValue).toBe('function')
    expect(info.getDefaultValue?.()).toBe('foo')
  })

  it('unwraps nested shapes and effects', () => {
    const shape = z
      .string()
      .default('bar')
      .optional()
      .nullable()
      .transform((v) => v)
    const info = zod3Adapter.getFieldInfo(shape)
    expect(info.typeName).toBe('ZodString')
    expect(info.optional).toBe(true)
    expect(info.nullable).toBe(true)
    expect(info.getDefaultValue?.()).toBe('bar')
  })

  it('returns enum values', () => {
    const info = zod3Adapter.getFieldInfo(z.enum(['a', 'b']))
    expect(info).toEqual({
      typeName: 'ZodEnum',
      optional: false,
      nullable: false,
      getDefaultValue: undefined,
      enumValues: ['a', 'b'],
    })
  })

  it('handles enums with optional, nullable and default modifiers', () => {
    const shape = z.enum(['x', 'y']).optional().nullable().default('x')
    const info = zod3Adapter.getFieldInfo(shape)
    expect(info.typeName).toBe('ZodEnum')
    expect(info.optional).toBe(true)
    expect(info.nullable).toBe(true)
    expect(info.enumValues).toEqual(['x', 'y'])
    expect(info.getDefaultValue?.()).toBe('x')
  })
})
