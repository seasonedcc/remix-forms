import Joi from 'joi'
import { expectTypeOf, it } from 'vitest'
import type { FormSchema, Infer } from '../prelude'

const schema = Joi.object({
  name: Joi.string().required(),
  age: Joi.number().required(),
  role: Joi.string().valid('admin', 'user').required(),
  bio: Joi.string(),
  note: Joi.string().required().allow(null),
})

it('satisfies FormSchema', () => {
  expectTypeOf(schema).toExtend<FormSchema>()
})

it('infers an output type', () => {
  // Joi does not perform deep type inference from its schema definitions.
  // Joi.object() produces ObjectSchema<any>, so Infer yields `any`.
  type Output = Infer<typeof schema>

  expectTypeOf<Output>().toBeAny()
})
