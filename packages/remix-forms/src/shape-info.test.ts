import { describe, expect, it } from 'vitest'
import * as z from 'zod'
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

  it('extracts info from boolean type', () => {
    expect(shapeInfo(z.boolean())).toEqual({
      typeName: 'ZodBoolean',
      optional: false,
      nullable: false,
      getDefaultValue: undefined,
      enumValues: undefined,
    })
  })

  it('extracts info from date type', () => {
    expect(shapeInfo(z.date())).toEqual({
      typeName: 'ZodDate',
      optional: false,
      nullable: false,
      getDefaultValue: undefined,
      enumValues: undefined,
    })
  })

  it('handles boolean with modifiers', () => {
    const info = shapeInfo(z.boolean().optional().default(true))
    expect(info.typeName).toBe('ZodBoolean')
    expect(info.optional).toBe(true)
    expect(info.getDefaultValue?.()).toBe(true)
  })

  it('handles date with modifiers', () => {
    const testDate = new Date('2025-01-01')
    const info = shapeInfo(z.date().nullable().default(testDate))
    expect(info.typeName).toBe('ZodDate')
    expect(info.nullable).toBe(true)
    expect(info.getDefaultValue?.()).toBe(testDate)
  })

  it('extracts input schema from pipe', () => {
    const shape = z.string().pipe(z.string().transform((v) => v.toUpperCase()))
    const info = shapeInfo(shape)
    expect(info.typeName).toBe('ZodString')
    expect(info.optional).toBe(false)
    expect(info.nullable).toBe(false)
  })

  it('handles pipe with modifiers', () => {
    const shape = z
      .number()
      .pipe(z.number().transform((v) => v * 2))
      .optional()
      .nullable()
    const info = shapeInfo(shape)
    expect(info.typeName).toBe('ZodNumber')
    expect(info.optional).toBe(true)
    expect(info.nullable).toBe(true)
  })

  it('handles pipe with default value', () => {
    const shape = z.string().pipe(z.string()).default('default')
    const info = shapeInfo(shape)
    expect(info.typeName).toBe('ZodString')
    expect(info.getDefaultValue?.()).toBe('default')
  })

  it('extracts input type from transform (which creates a pipe)', () => {
    const shape = z.string().transform((v) => v.toUpperCase())
    const info = shapeInfo(shape)
    expect(info.typeName).toBe('ZodString')
    expect(info.optional).toBe(false)
    expect(info.nullable).toBe(false)
  })

  it('returns null for unknown type', () => {
    const shape = z.object({ field: z.string() })
    const info = shapeInfo(shape)
    expect(info).toEqual({
      typeName: null,
      optional: false,
      nullable: false,
      getDefaultValue: undefined,
      enumValues: undefined,
    })
  })

  it('handles nullable followed by optional', () => {
    const info = shapeInfo(z.string().nullable().optional())
    expect(info.typeName).toBe('ZodString')
    expect(info.optional).toBe(true)
    expect(info.nullable).toBe(true)
  })

  it('handles optional followed by nullable', () => {
    const info = shapeInfo(z.string().optional().nullable())
    expect(info.typeName).toBe('ZodString')
    expect(info.optional).toBe(true)
    expect(info.nullable).toBe(true)
  })

  it('preserves enum value order', () => {
    const info = shapeInfo(z.enum(['first', 'second', 'third']))
    expect(info.enumValues).toEqual(['first', 'second', 'third'])
  })

  it('handles enum with single value', () => {
    const info = shapeInfo(z.enum(['only']))
    expect(info.typeName).toBe('ZodEnum')
    expect(info.enumValues).toEqual(['only'])
  })

  it('handles deeply nested modifiers', () => {
    const shape = z
      .number()
      .default(42)
      .optional()
      .nullable()
      .transform((v) => v)
    const info = shapeInfo(shape)
    expect(info.typeName).toBe('ZodNumber')
    expect(info.optional).toBe(true)
    expect(info.nullable).toBe(true)
    expect(info.getDefaultValue?.()).toBe(42)
  })

  it('handles complex pipe with multiple modifiers', () => {
    const shape = z
      .boolean()
      .pipe(z.boolean())
      .default(false)
      .optional()
      .nullable()
    const info = shapeInfo(shape)
    expect(info.typeName).toBe('ZodBoolean')
    expect(info.optional).toBe(true)
    expect(info.nullable).toBe(true)
    expect(info.getDefaultValue?.()).toBe(false)
  })

  it('handles date with all modifier types', () => {
    const testDate = new Date('2025-10-09')
    const shape = z.date().optional().nullable().default(testDate)
    const info = shapeInfo(shape)
    expect(info.typeName).toBe('ZodDate')
    expect(info.optional).toBe(true)
    expect(info.nullable).toBe(true)
    expect(info.getDefaultValue?.()).toBe(testDate)
  })
})
