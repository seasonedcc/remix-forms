import { expectTypeOf, it } from 'vitest'
import * as yup from 'yup'
import type { FormSchema, Infer } from '../prelude'

const schema = yup.object({
  name: yup.string().required(),
  age: yup.number().required(),
  role: yup.string().oneOf(['admin', 'user']).required(),
  bio: yup.string(),
  note: yup.string().required().nullable(),
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
