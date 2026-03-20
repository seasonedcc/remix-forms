import { type } from 'arktype'
import { expectTypeOf, it } from 'vitest'
import type { FormSchema, Infer } from '../prelude'

const schema = type({
  name: 'string',
  age: 'number',
  active: 'boolean',
  'bio?': 'string',
})

it('satisfies FormSchema', () => {
  expectTypeOf(schema).toExtend<FormSchema>()
})

it('infers the correct output type', () => {
  type Output = Infer<typeof schema>

  expectTypeOf<Output>().toHaveProperty('name').toBeString()
  expectTypeOf<Output>().toHaveProperty('age').toBeNumber()
  expectTypeOf<Output>().toHaveProperty('active').toBeBoolean()
  expectTypeOf<Output>()
    .toHaveProperty('bio')
    .toEqualTypeOf<string | undefined>()
})

it('infers the correct keys', () => {
  type Output = Infer<typeof schema>

  expectTypeOf<keyof Output>().toEqualTypeOf<
    'name' | 'age' | 'active' | 'bio'
  >()
})
