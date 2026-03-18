import { describe, expect, it } from 'vitest'
import { coerceFormData } from './coerce-form-data'
import type { FieldDescriptors } from './types'

const fields: FieldDescriptors = {
  name: { type: 'string' },
  age: { type: 'number' },
  agree: { type: 'boolean' },
  birthday: { type: 'date' },
  role: { type: 'enum' },
}

describe('coerceFormData', () => {
  it('coerces a FormData instance', () => {
    const fd = new FormData()
    fd.set('name', 'Jane')
    fd.set('age', '30')
    fd.set('agree', 'on')
    fd.set('birthday', '1994-06-15')
    fd.set('role', 'admin')

    const result = coerceFormData(fd, fields)

    expect(result.name).toBe('Jane')
    expect(result.age).toBe(30)
    expect(result.agree).toBe(true)
    expect(result.birthday).toEqual(new Date(1994, 5, 15))
    expect(result.role).toBe('admin')
  })

  it('coerces a plain record', () => {
    const data = {
      name: 'Jane',
      age: '30',
      agree: 'on',
      birthday: '1994-06-15',
      role: 'admin',
    }

    const result = coerceFormData(data, fields)

    expect(result.name).toBe('Jane')
    expect(result.age).toBe(30)
    expect(result.agree).toBe(true)
    expect(result.birthday).toEqual(new Date(1994, 5, 15))
    expect(result.role).toBe('admin')
  })

  it('only includes keys present in the field descriptors', () => {
    const fd = new FormData()
    fd.set('name', 'Jane')
    fd.set('extra', 'ignored')

    const result = coerceFormData(fd, { name: { type: 'string' } })

    expect(result).toEqual({ name: 'Jane' })
    expect(result).not.toHaveProperty('extra')
  })

  it('handles missing values according to optional/nullable', () => {
    const fd = new FormData()

    const result = coerceFormData(fd, {
      required: { type: 'string' },
      opt: { type: 'string', optional: true },
      nul: { type: 'string', nullable: true },
    })

    expect(result.required).toBe('')
    expect(result.opt).toBeUndefined()
    expect(result.nul).toBeNull()
  })
})
