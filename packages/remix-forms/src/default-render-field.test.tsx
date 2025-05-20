import * as React from 'react'
import { describe, expect, it } from 'vitest'
import type * as z from 'zod'
import type { FieldComponent } from './create-field'
import { defaultRenderField } from './default-render-field'

describe('defaultRenderField', () => {
  it('renders the provided Field component with props and key', () => {
    const Field = React.forwardRef<HTMLDivElement, Record<string, unknown>>(
      (props, ref) => <div ref={ref} {...props} />
    ) as unknown as FieldComponent<z.AnyZodObject>
    // biome-ignore lint/suspicious/noExplicitAny: test helper casting
    const element = (defaultRenderField as any)({
      Field,
      name: 'foo',
      label: 'Foo',
      // required Field properties for typing
      shape: {} as never,
      fieldType: 'string',
      required: false,
      dirty: false,
      // biome-ignore lint/suspicious/noExplicitAny: partial props for simplicity
    } as any)
    expect(element.key).toBe('foo')
    expect(element.type).toBe(Field)
    expect(element.props.name).toBe('foo')
    expect(element.props.label).toBe('Foo')
  })
})
