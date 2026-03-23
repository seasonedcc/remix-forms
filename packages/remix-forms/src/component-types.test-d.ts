import type * as React from 'react'
import { expectTypeOf, it } from 'vitest'
import type {
  ComponentMap,
  DefaultComponents,
  PropsOf,
  ResolveComponents,
} from './defaults'
import { defaultComponents } from './defaults'

it('PropsOf extracts props from a React component', () => {
  type MyProps = { size: string; color: number }
  type MyComp = React.ComponentType<MyProps>
  expectTypeOf<PropsOf<MyComp>>().toEqualTypeOf<MyProps>()
})

it('PropsOf extracts props from an intrinsic element string', () => {
  expectTypeOf<PropsOf<'input'>>().toEqualTypeOf<
    JSX.IntrinsicElements['input']
  >()
  expectTypeOf<PropsOf<'div'>>().toEqualTypeOf<JSX.IntrinsicElements['div']>()
  expectTypeOf<PropsOf<'button'>>().toEqualTypeOf<
    JSX.IntrinsicElements['button']
  >()
})

it('PropsOf returns Record<string, unknown> for unknown type', () => {
  expectTypeOf<PropsOf<'not-an-element'>>().toEqualTypeOf<
    Record<string, unknown>
  >()
})

it('ResolveComponents defaults all slots when Components is empty', () => {
  // biome-ignore lint/complexity/noBannedTypes: testing with empty object type
  type Resolved = ResolveComponents<{}>

  expectTypeOf<Resolved['input']>().toEqualTypeOf<DefaultComponents['input']>()
  expectTypeOf<Resolved['label']>().toEqualTypeOf<DefaultComponents['label']>()
  expectTypeOf<Resolved['button']>().toEqualTypeOf<
    DefaultComponents['button']
  >()
  expectTypeOf<Resolved['select']>().toEqualTypeOf<
    DefaultComponents['select']
  >()
  expectTypeOf<Resolved['error']>().toEqualTypeOf<DefaultComponents['error']>()
  expectTypeOf<Resolved['fields']>().toEqualTypeOf<
    DefaultComponents['fields']
  >()
})

it('ResolveComponents uses the override when provided', () => {
  type MyInput = React.FC<{ size: string }>
  type Resolved = ResolveComponents<{ input: MyInput }>

  expectTypeOf<Resolved['input']>().toEqualTypeOf<MyInput>()
})

it('ResolveComponents keeps other slots at defaults when partially overridden', () => {
  type MyInput = React.FC<{ size: string }>
  type Resolved = ResolveComponents<{ input: MyInput }>

  expectTypeOf<Resolved['label']>().toEqualTypeOf<DefaultComponents['label']>()
  expectTypeOf<Resolved['select']>().toEqualTypeOf<
    DefaultComponents['select']
  >()
  expectTypeOf<Resolved['button']>().toEqualTypeOf<
    DefaultComponents['button']
  >()
})

it('ResolveComponents handles multiple overrides', () => {
  type MyInput = React.FC<{ size: string }>
  type MyButton = React.FC<{ variant: 'primary' | 'secondary' }>
  type Resolved = ResolveComponents<{ input: MyInput; button: MyButton }>

  expectTypeOf<Resolved['input']>().toEqualTypeOf<MyInput>()
  expectTypeOf<Resolved['button']>().toEqualTypeOf<MyButton>()
  expectTypeOf<Resolved['label']>().toEqualTypeOf<DefaultComponents['label']>()
})

it('ResolveComponents strips undefined from optional overrides', () => {
  type Resolved = ResolveComponents<{
    input: React.FC<{ x: number }> | undefined
  }>

  expectTypeOf<Resolved['input']>().toEqualTypeOf<React.FC<{ x: number }>>()
})

it('ComponentMap allows both component types and strings', () => {
  expectTypeOf<{ input: React.FC }>().toExtend<Partial<ComponentMap>>()
  expectTypeOf<{ input: 'input' }>().toExtend<Partial<ComponentMap>>()
  expectTypeOf<{
    input: React.ForwardRefExoticComponent<
      React.PropsWithoutRef<{ size: string }> &
        React.RefAttributes<HTMLInputElement>
    >
  }>().toExtend<Partial<ComponentMap>>()
})

it('defaultComponents satisfies DefaultComponents', () => {
  expectTypeOf(defaultComponents).toExtend<DefaultComponents>()
})

it('defaultComponents has all ComponentMap keys', () => {
  expectTypeOf<keyof typeof defaultComponents>().toEqualTypeOf<
    keyof ComponentMap
  >()
})
