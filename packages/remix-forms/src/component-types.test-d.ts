import type * as React from 'react'
import { expectTypeOf, it } from 'vitest'
import * as z from 'zod'
import type {
  IsBoolean,
  IsEnum,
  SmartInputSlot,
  StripDefaultProps,
} from './create-field'
import type {
  ComponentMap,
  DefaultComponents,
  MergeComponents,
  NoOverrides,
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
  type MyInput = React.FC<
    Omit<JSX.IntrinsicElements['input'], 'size'> & { size?: string }
  >
  type Resolved = ResolveComponents<{ input: MyInput }>

  expectTypeOf<Resolved['input']>().toEqualTypeOf<MyInput>()
})

it('ResolveComponents keeps other slots at defaults when partially overridden', () => {
  type MyInput = React.FC<
    Omit<JSX.IntrinsicElements['input'], 'size'> & { size?: string }
  >
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
  type MyInput = React.FC<
    Omit<JSX.IntrinsicElements['input'], 'size'> & { size?: string }
  >
  type MyButton = React.FC<
    JSX.IntrinsicElements['button'] & { variant?: 'primary' | 'secondary' }
  >
  type Resolved = ResolveComponents<{ input: MyInput; button: MyButton }>

  expectTypeOf<Resolved['input']>().toEqualTypeOf<MyInput>()
  expectTypeOf<Resolved['button']>().toEqualTypeOf<MyButton>()
  expectTypeOf<Resolved['label']>().toEqualTypeOf<DefaultComponents['label']>()
})

it('ResolveComponents strips undefined from optional overrides', () => {
  type Resolved = ResolveComponents<{
    input: React.FC<JSX.IntrinsicElements['input'] & { x?: number }> | undefined
  }>

  expectTypeOf<Resolved['input']>().toEqualTypeOf<
    React.FC<JSX.IntrinsicElements['input'] & { x?: number }>
  >()
})

it('ComponentMap accepts components that handle the slot props', () => {
  expectTypeOf<{ input: React.FC }>().toExtend<Partial<ComponentMap>>()
  expectTypeOf<{
    input: React.ForwardRefExoticComponent<
      React.PropsWithoutRef<
        JSX.IntrinsicElements['input'] & { size?: string }
      > &
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

it('ComponentMap includes checkboxLabel and radioLabel slots', () => {
  expectTypeOf<ComponentMap>().toHaveProperty('checkboxLabel')
  expectTypeOf<ComponentMap>().toHaveProperty('radioLabel')
})

it('ResolveComponents defaults checkboxLabel and radioLabel', () => {
  // biome-ignore lint/complexity/noBannedTypes: testing with empty object type
  type Resolved = ResolveComponents<{}>
  expectTypeOf<Resolved['checkboxLabel']>().toEqualTypeOf<
    DefaultComponents['checkboxLabel']
  >()
  expectTypeOf<Resolved['radioLabel']>().toEqualTypeOf<
    DefaultComponents['radioLabel']
  >()
})

it('MergeComponents overrides checkboxLabel and radioLabel', () => {
  type CustomLabel = React.FC<{
    id?: string
    htmlFor?: string
    children?: React.ReactNode
    variant?: string
  }>
  type Merged = MergeComponents<
    { checkboxLabel: CustomLabel },
    { radioLabel: CustomLabel }
  >
  expectTypeOf<Merged['checkboxLabel']>().toEqualTypeOf<CustomLabel>()
  expectTypeOf<Merged['radioLabel']>().toEqualTypeOf<CustomLabel>()
})

it('NoOverrides extends Partial<ComponentMap>', () => {
  expectTypeOf<NoOverrides>().toExtend<Partial<ComponentMap>>()
})

it('MergeComponents falls through to base when no overrides', () => {
  type MyInput = React.FC<
    Omit<JSX.IntrinsicElements['input'], 'size'> & { size?: string }
  >
  type Base = { input: MyInput }
  type Merged = MergeComponents<Base, NoOverrides>

  expectTypeOf<Merged['input']>().toEqualTypeOf<MyInput>()
  expectTypeOf<Merged['label']>().toEqualTypeOf<DefaultComponents['label']>()
})

it('MergeComponents uses override over base', () => {
  type BaseInput = React.FC<
    Omit<JSX.IntrinsicElements['input'], 'size'> & { size?: string }
  >
  type OverrideInput = React.FC<
    JSX.IntrinsicElements['input'] & { variant?: string }
  >
  type Merged = MergeComponents<{ input: BaseInput }, { input: OverrideInput }>

  expectTypeOf<Merged['input']>().toEqualTypeOf<OverrideInput>()
})

it('MergeComponents 3-level cascade: override > base > default', () => {
  type BaseInput = React.FC<
    Omit<JSX.IntrinsicElements['input'], 'size'> & { size?: string }
  >
  type BaseButton = React.FC<
    JSX.IntrinsicElements['button'] & { variant?: string }
  >
  type OverrideInput = React.FC<JSX.IntrinsicElements['input'] & { x?: number }>
  type Merged = MergeComponents<
    { input: BaseInput; button: BaseButton },
    { input: OverrideInput }
  >

  expectTypeOf<Merged['input']>().toEqualTypeOf<OverrideInput>()
  expectTypeOf<Merged['button']>().toEqualTypeOf<BaseButton>()
  expectTypeOf<Merged['label']>().toEqualTypeOf<DefaultComponents['label']>()
})

// --- IsBoolean / IsEnum helpers ---

it('IsBoolean detects boolean fields', () => {
  expectTypeOf<IsBoolean<boolean>>().toEqualTypeOf<true>()
  expectTypeOf<IsBoolean<boolean | undefined>>().toEqualTypeOf<true>()
  expectTypeOf<IsBoolean<string>>().toEqualTypeOf<false>()
  expectTypeOf<IsBoolean<number>>().toEqualTypeOf<false>()
})

it('IsEnum detects string literal unions', () => {
  expectTypeOf<IsEnum<'a' | 'b'>>().toEqualTypeOf<true>()
  expectTypeOf<IsEnum<'a' | 'b' | undefined>>().toEqualTypeOf<true>()
  expectTypeOf<IsEnum<string>>().toEqualTypeOf<false>()
  expectTypeOf<IsEnum<string | undefined>>().toEqualTypeOf<false>()
  expectTypeOf<IsEnum<boolean>>().toEqualTypeOf<false>()
  expectTypeOf<IsEnum<number>>().toEqualTypeOf<false>()
})

// --- SmartInputSlot ---

it('SmartInputSlot resolves boolean field to checkbox', () => {
  const schema = z.object({ flag: z.boolean() })
  type S = typeof schema
  type Slot = SmartInputSlot<
    S,
    readonly [],
    readonly [],
    readonly [],
    'flag',
    undefined,
    undefined,
    undefined
  >
  expectTypeOf<Slot>().toEqualTypeOf<'checkbox'>()
})

it('SmartInputSlot resolves optional boolean to checkbox', () => {
  const schema = z.object({ flag: z.boolean().optional() })
  type S = typeof schema
  type Slot = SmartInputSlot<
    S,
    readonly [],
    readonly [],
    readonly [],
    'flag',
    undefined,
    undefined,
    undefined
  >
  expectTypeOf<Slot>().toEqualTypeOf<'checkbox'>()
})

it('SmartInputSlot resolves string to input', () => {
  const schema = z.object({ name: z.string() })
  type S = typeof schema
  type Slot = SmartInputSlot<
    S,
    readonly [],
    readonly [],
    readonly [],
    'name',
    undefined,
    undefined,
    undefined
  >
  expectTypeOf<Slot>().toEqualTypeOf<'input'>()
})

it('SmartInputSlot resolves enum to select', () => {
  const schema = z.object({ role: z.enum(['a', 'b']) })
  type S = typeof schema
  type Slot = SmartInputSlot<
    S,
    readonly [],
    readonly [],
    readonly [],
    'role',
    undefined,
    undefined,
    undefined
  >
  expectTypeOf<Slot>().toEqualTypeOf<'select'>()
})

it('SmartInputSlot resolves optional enum to select', () => {
  const schema = z.object({ role: z.enum(['a', 'b']).optional() })
  type S = typeof schema
  type Slot = SmartInputSlot<
    S,
    readonly [],
    readonly [],
    readonly [],
    'role',
    undefined,
    undefined,
    undefined
  >
  expectTypeOf<Slot>().toEqualTypeOf<'select'>()
})

it('SmartInputSlot resolves string in config multiline to multiline', () => {
  const schema = z.object({ bio: z.string() })
  type S = typeof schema
  type Slot = SmartInputSlot<
    S,
    readonly ['bio'],
    readonly [],
    readonly [],
    'bio',
    undefined,
    undefined,
    undefined
  >
  expectTypeOf<Slot>().toEqualTypeOf<'multiline'>()
})

it('SmartInputSlot resolves enum in config radio to radio', () => {
  const schema = z.object({ role: z.enum(['a', 'b']) })
  type S = typeof schema
  type Slot = SmartInputSlot<
    S,
    readonly [],
    readonly ['role'],
    readonly [],
    'role',
    undefined,
    undefined,
    undefined
  >
  expectTypeOf<Slot>().toEqualTypeOf<'radio'>()
})

it('SmartInputSlot resolves Field-level multiline=true to multiline', () => {
  const schema = z.object({ notes: z.string() })
  type S = typeof schema
  type Slot = SmartInputSlot<
    S,
    readonly [],
    readonly [],
    readonly [],
    'notes',
    true,
    undefined,
    undefined
  >
  expectTypeOf<Slot>().toEqualTypeOf<'multiline'>()
})

it('SmartInputSlot resolves Field-level radio=true to radio', () => {
  const schema = z.object({ choice: z.string() })
  type S = typeof schema
  type Slot = SmartInputSlot<
    S,
    readonly [],
    readonly [],
    readonly [],
    'choice',
    undefined,
    true,
    undefined
  >
  expectTypeOf<Slot>().toEqualTypeOf<'radio'>()
})

it('SmartInputSlot: Field-level radio=true overrides config multiline', () => {
  const schema = z.object({ field: z.string() })
  type S = typeof schema
  type Slot = SmartInputSlot<
    S,
    readonly ['field'],
    readonly [],
    readonly [],
    'field',
    undefined,
    true,
    undefined
  >
  expectTypeOf<Slot>().toEqualTypeOf<'radio'>()
})

it('SmartInputSlot: boolean always wins over Field-level radio', () => {
  const schema = z.object({ flag: z.boolean() })
  type S = typeof schema
  type Slot = SmartInputSlot<
    S,
    readonly [],
    readonly [],
    readonly [],
    'flag',
    undefined,
    true,
    undefined
  >
  expectTypeOf<Slot>().toEqualTypeOf<'checkbox'>()
})

it('SmartInputSlot: Field-level hidden=true resolves boolean to input', () => {
  const schema = z.object({ flag: z.boolean() })
  type S = typeof schema
  type Slot = SmartInputSlot<
    S,
    readonly [],
    readonly [],
    readonly [],
    'flag',
    undefined,
    undefined,
    true
  >
  expectTypeOf<Slot>().toEqualTypeOf<'input'>()
})

it('SmartInputSlot: Field-level hidden=true resolves enum to input', () => {
  const schema = z.object({ role: z.enum(['a', 'b']) })
  type S = typeof schema
  type Slot = SmartInputSlot<
    S,
    readonly [],
    readonly [],
    readonly [],
    'role',
    undefined,
    undefined,
    true
  >
  expectTypeOf<Slot>().toEqualTypeOf<'input'>()
})

it('SmartInputSlot: schema-level Hidden resolves boolean to input', () => {
  const schema = z.object({ flag: z.boolean() })
  type S = typeof schema
  type Slot = SmartInputSlot<
    S,
    readonly [],
    readonly [],
    readonly ['flag'],
    'flag',
    undefined,
    undefined,
    undefined
  >
  expectTypeOf<Slot>().toEqualTypeOf<'input'>()
})

it('SmartInputSlot: schema-level Hidden resolves enum to input', () => {
  const schema = z.object({ role: z.enum(['a', 'b']) })
  type S = typeof schema
  type Slot = SmartInputSlot<
    S,
    readonly [],
    readonly [],
    readonly ['role'],
    'role',
    undefined,
    undefined,
    undefined
  >
  expectTypeOf<Slot>().toEqualTypeOf<'input'>()
})

it('SmartInputSlot: schema-level Hidden does not affect other fields', () => {
  const schema = z.object({
    secret: z.string(),
    flag: z.boolean(),
  })
  type S = typeof schema
  type HiddenSlot = SmartInputSlot<
    S,
    readonly [],
    readonly [],
    readonly ['secret'],
    'secret',
    undefined,
    undefined,
    undefined
  >
  type VisibleSlot = SmartInputSlot<
    S,
    readonly [],
    readonly [],
    readonly ['secret'],
    'flag',
    undefined,
    undefined,
    undefined
  >
  expectTypeOf<HiddenSlot>().toEqualTypeOf<'input'>()
  expectTypeOf<VisibleSlot>().toEqualTypeOf<'checkbox'>()
})

// --- StripDefaultProps ---

it('StripDefaultProps removes specified props from a component type', () => {
  type MyComp = React.ComponentType<{
    defaultValue?: string
    name: string
    id?: string
  }>
  type Stripped = StripDefaultProps<MyComp, 'defaultValue'>
  type Expected = React.ComponentType<{ name: string; id?: string }>
  expectTypeOf<Stripped>().toEqualTypeOf<Expected>()
})

it('StripDefaultProps removes defaultValue from resolved Input', () => {
  type Resolved = ResolveComponents<Record<never, never>>
  type StrippedInput = StripDefaultProps<Resolved['input'], 'defaultValue'>
  expectTypeOf<PropsOf<StrippedInput>>().not.toHaveProperty('defaultValue')
})

it('StripDefaultProps removes defaultValue from resolved Multiline', () => {
  type Resolved = ResolveComponents<Record<never, never>>
  type StrippedMultiline = StripDefaultProps<
    Resolved['multiline'],
    'defaultValue'
  >
  expectTypeOf<PropsOf<StrippedMultiline>>().not.toHaveProperty('defaultValue')
})

it('StripDefaultProps removes defaultValue from resolved Select', () => {
  type Resolved = ResolveComponents<Record<never, never>>
  type StrippedSelect = StripDefaultProps<Resolved['select'], 'defaultValue'>
  expectTypeOf<PropsOf<StrippedSelect>>().not.toHaveProperty('defaultValue')
})

it('StripDefaultProps removes defaultChecked from resolved Checkbox', () => {
  type Resolved = ResolveComponents<Record<never, never>>
  type StrippedCheckbox = StripDefaultProps<
    Resolved['checkbox'],
    'defaultChecked'
  >
  expectTypeOf<PropsOf<StrippedCheckbox>>().not.toHaveProperty('defaultChecked')
})

it('StripDefaultProps removes defaultChecked from resolved Radio', () => {
  type Resolved = ResolveComponents<Record<never, never>>
  type StrippedRadio = StripDefaultProps<Resolved['radio'], 'defaultChecked'>
  expectTypeOf<PropsOf<StrippedRadio>>().not.toHaveProperty('defaultChecked')
})
