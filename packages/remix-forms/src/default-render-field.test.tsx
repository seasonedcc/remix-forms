import * as React from 'react'
import { describe, expect, it } from 'vitest'
import type { FieldComponent } from './create-field'
import {
  defaultRenderArrayArrayItem,
  defaultRenderArrayField,
  defaultRenderObjectArrayItem,
  defaultRenderObjectField,
  defaultRenderScalarArrayItem,
  defaultRenderScalarField,
} from './default-render-field'
import type { FormSchema } from './prelude'

const Field = React.forwardRef<HTMLDivElement, Record<string, unknown>>(
  (props, ref) => <div ref={ref} {...props} />
) as unknown as FieldComponent<
  FormSchema,
  // biome-ignore lint/suspicious/noExplicitAny: test helper casting
  any,
  readonly [],
  readonly [],
  readonly []
>

describe('defaultRenderScalarField', () => {
  it('renders the provided Field component with props and key', () => {
    // biome-ignore lint/suspicious/noExplicitAny: test helper casting
    const element = (defaultRenderScalarField as any)({
      Field,
      name: 'foo',
      label: 'Foo',
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

describe('defaultRenderArrayField', () => {
  it('renders the provided Field component with props and key', () => {
    // biome-ignore lint/suspicious/noExplicitAny: test helper casting
    const element = (defaultRenderArrayField as any)({
      Field,
      name: 'tags',
      label: 'Tags',
      shape: { type: 'array', item: { type: 'string' } } as never,
      fieldType: 'array',
      emptyArrayLabel: 'No items',
      required: false,
      dirty: false,
      // biome-ignore lint/suspicious/noExplicitAny: partial props for simplicity
    } as any)
    expect(element.key).toBe('tags')
    expect(element.type).toBe(Field)
    expect(element.props.name).toBe('tags')
    expect(element.props.label).toBe('Tags')
  })
})

describe('defaultRenderObjectField', () => {
  it('renders the provided Field component with props and key', () => {
    // biome-ignore lint/suspicious/noExplicitAny: test helper casting
    const element = (defaultRenderObjectField as any)({
      Field,
      name: 'address',
      label: 'Address',
      shape: { type: 'object', fields: {} } as never,
      fieldType: 'object',
      required: false,
      dirty: false,
      // biome-ignore lint/suspicious/noExplicitAny: partial props for simplicity
    } as any)
    expect(element.key).toBe('address')
    expect(element.type).toBe(Field)
    expect(element.props.name).toBe('address')
    expect(element.props.label).toBe('Address')
  })
})

describe('defaultRenderScalarArrayItem', () => {
  it('renders Item with itemKey as the React key', () => {
    const Item = ({ index }: { index?: number }) => <div>{index}</div>
    // biome-ignore lint/suspicious/noExplicitAny: test helper casting
    const element = (defaultRenderScalarArrayItem as any)({
      Item,
      itemKey: 'abc',
      index: 0,
      RemoveButton: 'button',
      remove: () => {},
      move: () => {},
      swap: () => {},
    })
    expect(element.key).toBe('abc')
    expect(element.type).toBe(Item)
  })
})

describe('defaultRenderObjectArrayItem', () => {
  it('renders Item with itemKey as the React key', () => {
    const Item = ({ index }: { index?: number }) => <div>{index}</div>
    // biome-ignore lint/suspicious/noExplicitAny: test helper casting
    const element = (defaultRenderObjectArrayItem as any)({
      Item,
      itemKey: 'def',
      index: 1,
      RemoveButton: 'button',
      remove: () => {},
      move: () => {},
      swap: () => {},
    })
    expect(element.key).toBe('def')
    expect(element.type).toBe(Item)
  })
})

describe('defaultRenderArrayArrayItem', () => {
  it('renders Item with itemKey as the React key', () => {
    const Item = ({ index }: { index?: number }) => <div>{index}</div>
    // biome-ignore lint/suspicious/noExplicitAny: test helper casting
    const element = (defaultRenderArrayArrayItem as any)({
      Item,
      itemKey: 'ghi',
      index: 2,
      RemoveButton: 'button',
      remove: () => {},
      move: () => {},
      swap: () => {},
    })
    expect(element.key).toBe('ghi')
    expect(element.type).toBe(Item)
  })
})
