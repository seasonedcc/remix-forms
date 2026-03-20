import * as v from 'valibot'
import { expectTypeOf, it } from 'vitest'
import type { FormSchema, Infer } from '../prelude'

const schema = v.object({
  name: v.string(),
  age: v.number(),
  role: v.picklist(['admin', 'user']),
  bio: v.optional(v.string()),
  note: v.nullable(v.string()),
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
  type Output = Infer<typeof schema>

  expectTypeOf<keyof Output>().toEqualTypeOf<
    'name' | 'age' | 'role' | 'bio' | 'note'
  >()
})
