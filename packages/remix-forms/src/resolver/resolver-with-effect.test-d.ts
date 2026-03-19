import { Schema as S } from 'effect'
import { expectTypeOf, it } from 'vitest'
import type { FormSchema, Infer } from '../prelude'

const schema = S.standardSchemaV1(
  S.Struct({
    name: S.String,
    age: S.Number,
    role: S.Literal('admin', 'user'),
    bio: S.optional(S.String),
  })
)

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
})

it('infers the correct keys', () => {
  type Output = Infer<typeof schema>

  expectTypeOf<keyof Output>().toEqualTypeOf<'name' | 'age' | 'role' | 'bio'>()
})
