import { describe, expect, it } from 'vitest'
import * as z from 'zod/v4'
import { shapeInfo } from './shape-info'

describe('shapeInfo', () => {
  it('returns null type when shape is undefined', () => {
    expect(shapeInfo()).toEqual({
      typeName: null,
      optional: false,
      nullable: false,
      getDefaultValue: undefined,
      enumValues: undefined,
    })
  })

  it('extracts info from primitive shapes', () => {
    expect(shapeInfo(z.string())).toEqual({
      typeName: 'ZodString',
      optional: false,
      nullable: false,
      getDefaultValue: undefined,
      enumValues: undefined,
    })
  })

  it('marks optional and nullable shapes correctly', () => {
    const info = shapeInfo(z.number().optional().nullable())
    expect(info).toEqual({
      typeName: 'ZodNumber',
      optional: true,
      nullable: true,
      getDefaultValue: undefined,
      enumValues: undefined,
    })
  })

  it('collects default value getter', () => {
    const info = shapeInfo(z.string().default('foo'))
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
    const info = shapeInfo(shape)
    expect(info.typeName).toBe('ZodString')
    expect(info.optional).toBe(true)
    expect(info.nullable).toBe(true)
    expect(info.getDefaultValue?.()).toBe('bar')
  })

  it('unwraps pipelines to their output schema', () => {
    const pipeline = z.string().pipe(z.string().default('baz'))
    const info = shapeInfo(pipeline)
    expect(info.typeName).toBe('ZodString')
    expect(info.getDefaultValue?.()).toBe('baz')
  })

  it('returns enum values', () => {
    const info = shapeInfo(z.enum(['a', 'b']))
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
    const info = shapeInfo(shape)
    expect(info.typeName).toBe('ZodEnum')
    expect(info.optional).toBe(true)
    expect(info.nullable).toBe(true)
    expect(info.enumValues).toEqual(['x', 'y'])
    expect(info.getDefaultValue?.()).toBe('x')
  })
})
