import { describe, expect, it } from 'vitest'
import { SchemaForm, formAction, performMutation, useField } from './index'

describe('index exports', () => {
  it('exposes the public API', () => {
    expect(SchemaForm).toBeDefined()
    expect(useField).toBeDefined()
    expect(formAction).toBeDefined()
    expect(performMutation).toBeDefined()
  })
})
