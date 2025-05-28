import { describe, expect, it } from 'vitest'
import {
  SchemaForm,
  formAction,
  performMutation,
  useField,
  zod3Adapter,
} from './index'

describe('index exports', () => {
  it('exposes the public API', () => {
    expect(SchemaForm).toBeDefined()
    expect(useField).toBeDefined()
    expect(formAction).toBeDefined()
    expect(performMutation).toBeDefined()
    expect(zod3Adapter).toBeDefined()
  })
})
