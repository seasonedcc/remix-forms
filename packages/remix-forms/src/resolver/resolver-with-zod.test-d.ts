import { expectTypeOf, it } from 'vitest'
import { z } from 'zod'
import type { FormSchema, Infer } from '../prelude'

const schema = z.object({
  name: z.string(),
  age: z.number(),
  role: z.enum(['admin', 'user']),
  bio: z.string().optional(),
  note: z.string().nullable(),
})

it('satisfies FormSchema', () => {
  expectTypeOf(schema).toExtend<FormSchema>()
})

it('infers the correct output type', () => {
  type Output = Infer<typeof schema>

  expectTypeOf<Output>().toHaveProperty('name').toBeString()
  expectTypeOf<Output>().toHaveProperty('age').toBeNumber()
  expectTypeOf<Output>()
    .toHaveProperty('role')
    .toEqualTypeOf<'admin' | 'user'>()
  expectTypeOf<Output>()
    .toHaveProperty('bio')
    .toEqualTypeOf<string | undefined>()
  expectTypeOf<Output>().toHaveProperty('note').toEqualTypeOf<string | null>()
})

it('infers the correct keys', () => {
  type Keys = keyof Infer<typeof schema>

  expectTypeOf<Keys>().toEqualTypeOf<'name' | 'age' | 'role' | 'bio' | 'note'>()
})

it('infers non-optional output for fields with defaults', () => {
  const withDefault = z.object({
    name: z.string().default('Anonymous'),
  })

  type Output = Infer<typeof withDefault>

  expectTypeOf<Output['name']>().toEqualTypeOf<string>()
})

it('satisfies FormSchema with transforms', () => {
  const withTransform = z.object({
    age: z.string().transform(Number),
  })

  expectTypeOf(withTransform).toExtend<FormSchema>()
})
