import type * as React from 'react'
import { expectTypeOf, it } from 'vitest'
import * as z from 'zod'
import type {
  FieldComponent,
  IsBoolean,
  IsEnum,
  ScopedFieldComponent,
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
import type { RenderFormProps, SchemaFormProps } from './schema-form'

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

it('ComponentMap does not include checkboxWrapper or radioWrapper', () => {
  expectTypeOf<ComponentMap>().not.toHaveProperty('checkboxWrapper')
  expectTypeOf<ComponentMap>().not.toHaveProperty('radioWrapper')
})

it('MergeComponents overrides checkboxLabel and radioLabel', () => {
  type CustomLabel = React.FC<{
    id?: string
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

// --- PropsOf with forwardRef ---

it('PropsOf extracts props from a forwardRef component', () => {
  type MyRef = React.ForwardRefExoticComponent<
    React.PropsWithoutRef<{ size: string; color: number }> &
      React.RefAttributes<HTMLDivElement>
  >
  expectTypeOf<PropsOf<MyRef>>().toHaveProperty('size')
  expectTypeOf<PropsOf<MyRef>>().toHaveProperty('color')
})

// --- FieldComponent inferred SmartInput props ---

it('Field accepts type prop (from SmartInput inferred)', () => {
  const schema = z.object({ name: z.string() })
  type S = typeof schema
  type Resolved = ResolveComponents<Record<never, never>>
  type FC = FieldComponent<S, Resolved, readonly [], readonly [], readonly []>
  type Props = Parameters<FC>[0]
  expectTypeOf<Props>().toHaveProperty('type')
})

it('Field accepts autoComplete prop (from SmartInput inferred)', () => {
  const schema = z.object({ name: z.string() })
  type S = typeof schema
  type Resolved = ResolveComponents<Record<never, never>>
  type FC = FieldComponent<S, Resolved, readonly [], readonly [], readonly []>
  type Props = Parameters<FC>[0]
  expectTypeOf<Props>().toHaveProperty('autoComplete')
})

it('Field does not accept registerProps (internal)', () => {
  const schema = z.object({ name: z.string() })
  type S = typeof schema
  type Resolved = ResolveComponents<Record<never, never>>
  type FC = FieldComponent<S, Resolved, readonly [], readonly [], readonly []>
  type Props = Parameters<FC>[0]
  expectTypeOf<Props>().not.toHaveProperty('registerProps')
})

it('Field does not accept a11yProps (internal)', () => {
  const schema = z.object({ name: z.string() })
  type S = typeof schema
  type Resolved = ResolveComponents<Record<never, never>>
  type FC = FieldComponent<S, Resolved, readonly [], readonly [], readonly []>
  type Props = Parameters<FC>[0]
  expectTypeOf<Props>().not.toHaveProperty('a11yProps')
})

it('Field does not accept className (internal)', () => {
  const schema = z.object({ name: z.string() })
  type S = typeof schema
  type Resolved = ResolveComponents<Record<never, never>>
  type FC = FieldComponent<S, Resolved, readonly [], readonly [], readonly []>
  type Props = Parameters<FC>[0]
  expectTypeOf<Props>().not.toHaveProperty('className')
})

// --- fieldProps wrapper prop inference ---

it('fieldProps accepts wrapper component props', () => {
  const schema = z.object({ name: z.string() })
  type S = typeof schema
  type Resolved = ResolveComponents<Record<never, never>>
  type FC = FieldComponent<S, Resolved, readonly [], readonly [], readonly []>
  type Props = Parameters<FC>[0]
  expectTypeOf<Props>().toHaveProperty('fieldProps')
})

it('fieldProps with custom field component accepts custom wrapper props', () => {
  type CustomField = React.FC<{
    hidden?: boolean
    style?: React.CSSProperties
    children?: React.ReactNode
    variant?: 'outlined' | 'filled'
  }>
  const schema = z.object({ name: z.string() })
  type S = typeof schema
  type Resolved = MergeComponents<{ field: CustomField }, NoOverrides>
  type FC = FieldComponent<S, Resolved, readonly [], readonly [], readonly []>
  type Props = Parameters<FC>[0]
  type FieldPropsType = NonNullable<Props['fieldProps']>
  expectTypeOf<FieldPropsType>().toHaveProperty('variant')
  expectTypeOf<FieldPropsType>().not.toHaveProperty('className')
})

// --- RenderForm ---

it('SchemaFormProps accepts optional renderForm', () => {
  const schema = z.object({ name: z.string() })
  type Props = SchemaFormProps<
    typeof schema,
    Record<never, never>,
    Record<never, never>,
    readonly [],
    readonly [],
    readonly []
  >
  expectTypeOf<Props>().toHaveProperty('renderForm')
})

it('RenderFormProps includes fetcher, disabled, and buttonLabel', () => {
  const schema = z.object({ name: z.string() })
  type S = typeof schema
  type Resolved = ResolveComponents<Record<never, never>>
  type Props = RenderFormProps<
    S,
    Resolved,
    readonly [],
    readonly [],
    readonly []
  >
  expectTypeOf<Props>().toHaveProperty('fetcher')
  expectTypeOf<Props>().toHaveProperty('disabled')
  expectTypeOf<Props>().toHaveProperty('buttonLabel')
  expectTypeOf<Props['disabled']>().toBeBoolean()
  expectTypeOf<Props['buttonLabel']>().toBeString()
})

it('RenderFormProps includes component helpers and useFormReturn', () => {
  const schema = z.object({ name: z.string() })
  type S = typeof schema
  type Resolved = ResolveComponents<Record<never, never>>
  type Props = RenderFormProps<
    S,
    Resolved,
    readonly [],
    readonly [],
    readonly []
  >
  expectTypeOf<Props>().toHaveProperty('Field')
  expectTypeOf<Props>().toHaveProperty('Fields')
  expectTypeOf<Props>().toHaveProperty('Errors')
  expectTypeOf<Props>().toHaveProperty('Error')
  expectTypeOf<Props>().toHaveProperty('Button')
  expectTypeOf<Props>().toHaveProperty('submit')
  expectTypeOf<Props>().toHaveProperty('register')
  expectTypeOf<Props>().toHaveProperty('formState')
})

// --- ScopedFieldComponent ---

it('ScopedFieldComponent constrains name to object keys', () => {
  type T = { street: string; city: string }
  type Resolved = ResolveComponents<Record<never, never>>
  type FC = ScopedFieldComponent<T, Resolved>
  type Props = Parameters<FC>[0]
  expectTypeOf<Props['name']>().toEqualTypeOf<'street' | 'city'>()
})

it('ScopedFieldComponent accepts valid sub-field name', () => {
  type T = { street: string; city: string }
  type Resolved = ResolveComponents<Record<never, never>>
  type FC = ScopedFieldComponent<T, Resolved>
  expectTypeOf<{ name: 'street' }>().toMatchTypeOf<Parameters<FC>[0]>()
})

it('ScopedFieldComponent rejects invalid sub-field name', () => {
  type T = { street: string; city: string }
  type Resolved = ResolveComponents<Record<never, never>>
  type FC = ScopedFieldComponent<T, Resolved>
  expectTypeOf<{ name: 'nonexistent' }>().not.toMatchTypeOf<Parameters<FC>[0]>()
})

// --- ObjectChildren helpers ---

it('ObjectChildren provides typed Field, Title, Errors, Error', () => {
  const schema = z.object({
    billing: z.object({ street: z.string(), city: z.string() }),
  })
  type S = typeof schema
  type Resolved = ResolveComponents<Record<never, never>>
  type FC = FieldComponent<S, Resolved, readonly [], readonly [], readonly []>
  type BillingProps = Parameters<FC>[0] & { name: 'billing' }
  type BillingChildren = NonNullable<BillingProps['children']>
  type Helpers = Parameters<BillingChildren>[0]
  expectTypeOf<Helpers>().toHaveProperty('Field')
  expectTypeOf<Helpers>().toHaveProperty('Title')
  expectTypeOf<Helpers>().toHaveProperty('ObjectFields')
  expectTypeOf<Helpers>().toHaveProperty('Errors')
  expectTypeOf<Helpers>().toHaveProperty('Error')
})

it('ObjectChildren does not expose array or scalar helpers', () => {
  const schema = z.object({
    billing: z.object({ street: z.string() }),
  })
  type S = typeof schema
  type Resolved = ResolveComponents<Record<never, never>>
  type FC = FieldComponent<S, Resolved, readonly [], readonly [], readonly []>
  type BillingProps = Parameters<FC>[0] & { name: 'billing' }
  type BillingChildren = NonNullable<BillingProps['children']>
  type Helpers = Parameters<BillingChildren>[0]
  expectTypeOf<Helpers>().not.toHaveProperty('items')
  expectTypeOf<Helpers>().not.toHaveProperty('append')
  expectTypeOf<Helpers>().not.toHaveProperty('SmartInput')
  expectTypeOf<Helpers>().not.toHaveProperty('Input')
})

it('ObjectChildren scoped Field constrains name to sub-keys', () => {
  const schema = z.object({
    billing: z.object({ street: z.string(), city: z.string() }),
  })
  type S = typeof schema
  type Resolved = ResolveComponents<Record<never, never>>
  type FC = FieldComponent<S, Resolved, readonly [], readonly [], readonly []>
  type BillingProps = Parameters<FC>[0] & { name: 'billing' }
  type BillingChildren = NonNullable<BillingProps['children']>
  type Helpers = Parameters<BillingChildren>[0]
  type ScopedFC = Helpers['Field']
  type ScopedProps = Parameters<ScopedFC>[0]
  expectTypeOf<ScopedProps['name']>().toEqualTypeOf<'street' | 'city'>()
})

// --- ArrayChildren helpers ---

it('ArrayChildren provides items, append, remove, etc.', () => {
  const schema = z.object({ tags: z.array(z.string()) })
  type S = typeof schema
  type Resolved = ResolveComponents<Record<never, never>>
  type FC = FieldComponent<S, Resolved, readonly [], readonly [], readonly []>
  type TagsProps = Parameters<FC>[0] & { name: 'tags' }
  type TagsChildren = NonNullable<TagsProps['children']>
  type Helpers = Parameters<TagsChildren>[0]
  expectTypeOf<Helpers>().toHaveProperty('items')
  expectTypeOf<Helpers>().toHaveProperty('append')
  expectTypeOf<Helpers>().toHaveProperty('prepend')
  expectTypeOf<Helpers>().toHaveProperty('remove')
  expectTypeOf<Helpers>().toHaveProperty('insert')
  expectTypeOf<Helpers>().toHaveProperty('move')
  expectTypeOf<Helpers>().toHaveProperty('swap')
})

it('ArrayChildren provides AddButton, RemoveButton, and ArrayEmpty', () => {
  const schema = z.object({ tags: z.array(z.string()) })
  type S = typeof schema
  type Resolved = ResolveComponents<Record<never, never>>
  type FC = FieldComponent<S, Resolved, readonly [], readonly [], readonly []>
  type TagsProps = Parameters<FC>[0] & { name: 'tags' }
  type TagsChildren = NonNullable<TagsProps['children']>
  type Helpers = Parameters<TagsChildren>[0]
  expectTypeOf<Helpers>().toHaveProperty('AddButton')
  expectTypeOf<Helpers>().toHaveProperty('RemoveButton')
  expectTypeOf<Helpers>().toHaveProperty('ArrayEmpty')
  expectTypeOf<Helpers>().toHaveProperty('ScalarArrayField')
})

it('array children items are pure data with key and index', () => {
  const schema = z.object({ tags: z.array(z.string()) })
  type S = typeof schema
  type Resolved = ResolveComponents<Record<never, never>>
  type FC = FieldComponent<S, Resolved, readonly [], readonly [], readonly []>
  type TagsProps = Parameters<FC>[0] & { name: 'tags' }
  type TagsChildren = NonNullable<TagsProps['children']>
  type Helpers = Parameters<TagsChildren>[0]
  type Item = Helpers['items'][number]
  expectTypeOf<Item>().toHaveProperty('key')
  expectTypeOf<Item>().toHaveProperty('index')
  expectTypeOf<Item>().not.toHaveProperty('SmartInput')
  expectTypeOf<Item>().not.toHaveProperty('Field')
})

it('scalar array children provide Item component with SmartInput helpers', () => {
  const schema = z.object({ tags: z.array(z.string()) })
  type S = typeof schema
  type Resolved = ResolveComponents<Record<never, never>>
  type FC = FieldComponent<S, Resolved, readonly [], readonly [], readonly []>
  type TagsProps = Parameters<FC>[0] & { name: 'tags' }
  type TagsChildren = NonNullable<TagsProps['children']>
  type Helpers = Parameters<TagsChildren>[0]
  type ItemComp = Helpers['Item']
  type IP = React.ComponentProps<ItemComp>
  type ItemChildrenFn = IP['children']
  type ItemHelpers = Parameters<ItemChildrenFn>[0]
  expectTypeOf<ItemHelpers>().toHaveProperty('SmartInput')
  expectTypeOf<ItemHelpers>().not.toHaveProperty('Field')
})

it('object array Item children provide typed Field', () => {
  const schema = z.object({
    contacts: z.array(z.object({ name: z.string(), email: z.string() })),
  })
  type S = typeof schema
  type Resolved = ResolveComponents<Record<never, never>>
  type FC = FieldComponent<S, Resolved, readonly [], readonly [], readonly []>
  type ContactsProps = Parameters<FC>[0] & { name: 'contacts' }
  type ContactsChildren = NonNullable<ContactsProps['children']>
  type Helpers = Parameters<ContactsChildren>[0]
  type ItemComp = Helpers['Item']
  type IP = React.ComponentProps<ItemComp>
  type ItemChildrenFn = IP['children']
  type ItemHelpers = Parameters<ItemChildrenFn>[0]
  expectTypeOf<ItemHelpers>().toHaveProperty('Field')
  expectTypeOf<ItemHelpers>().not.toHaveProperty('SmartInput')
  type FieldFC = ItemHelpers['Field']
  type FieldProps = Parameters<FieldFC>[0]
  expectTypeOf<FieldProps['name']>().toEqualTypeOf<'name' | 'email'>()
})

// --- ScalarChildren helpers ---

it('ScalarChildren provides SmartInput and Input, not Field or items', () => {
  const schema = z.object({ name: z.string() })
  type S = typeof schema
  type Resolved = ResolveComponents<Record<never, never>>
  type FC = FieldComponent<S, Resolved, readonly [], readonly [], readonly []>
  type NameProps = Parameters<FC>[0] & { name: 'name' }
  type NameChildren = NonNullable<NameProps['children']>
  type Helpers = Parameters<NameChildren>[0]
  expectTypeOf<Helpers>().toHaveProperty('SmartInput')
  expectTypeOf<Helpers>().toHaveProperty('Input')
  expectTypeOf<Helpers>().toHaveProperty('Label')
  expectTypeOf<Helpers>().not.toHaveProperty('Field')
  expectTypeOf<Helpers>().not.toHaveProperty('items')
  expectTypeOf<Helpers>().not.toHaveProperty('append')
})

// --- Recursive nesting ---

it('deeply nested object provides recursive scoped Field', () => {
  const schema = z.object({
    company: z.object({
      address: z.object({ street: z.string(), zip: z.string() }),
    }),
  })
  type S = typeof schema
  type Resolved = ResolveComponents<Record<never, never>>
  type FC = FieldComponent<S, Resolved, readonly [], readonly [], readonly []>
  type CompanyProps = Parameters<FC>[0] & { name: 'company' }
  type CompanyChildren = NonNullable<CompanyProps['children']>
  type CompanyHelpers = Parameters<CompanyChildren>[0]
  type CompanyField = CompanyHelpers['Field']
  type CompanyFieldProps = Parameters<CompanyField>[0]
  expectTypeOf<CompanyFieldProps['name']>().toEqualTypeOf<'address'>()
  type AddressProps = CompanyFieldProps & { name: 'address' }
  type AddressChildren = NonNullable<AddressProps['children']>
  type AddressHelpers = Parameters<AddressChildren>[0]
  type AddressField = AddressHelpers['Field']
  type AddressFieldProps = Parameters<AddressField>[0]
  expectTypeOf<AddressFieldProps['name']>().toEqualTypeOf<'street' | 'zip'>()
})

// --- Optional/nullable nested objects ---

it('optional nested object still provides valid sub-keys', () => {
  const schema = z.object({
    profile: z.object({ bio: z.string() }).optional(),
  })
  type S = typeof schema
  type Resolved = ResolveComponents<Record<never, never>>
  type FC = FieldComponent<S, Resolved, readonly [], readonly [], readonly []>
  type ProfileProps = Parameters<FC>[0] & { name: 'profile' }
  type ProfileChildren = NonNullable<ProfileProps['children']>
  type Helpers = Parameters<ProfileChildren>[0]
  type ScopedFC = Helpers['Field']
  type ScopedProps = Parameters<ScopedFC>[0]
  expectTypeOf<ScopedProps['name']>().toEqualTypeOf<'bio'>()
})

// --- Mixed nesting: object with array sub-field ---

it('scoped Field for an array-only object provides array children', () => {
  const schema = z.object({
    group: z.object({
      emails: z.array(z.string()),
    }),
  })
  type S = typeof schema
  type Resolved = ResolveComponents<Record<never, never>>
  type FC = FieldComponent<S, Resolved, readonly [], readonly [], readonly []>
  type GroupProps = Parameters<FC>[0] & { name: 'group' }
  type GroupChildren = NonNullable<GroupProps['children']>
  type GroupHelpers = Parameters<GroupChildren>[0]
  type GroupField = GroupHelpers['Field']
  type EmailsProps = Parameters<GroupField>[0] & { name: 'emails' }
  type EmailsChildren = NonNullable<EmailsProps['children']>
  type EmailsHelpers = Parameters<EmailsChildren>[0]
  expectTypeOf<EmailsHelpers>().toHaveProperty('items')
  expectTypeOf<EmailsHelpers>().toHaveProperty('append')
  expectTypeOf<EmailsHelpers>().not.toHaveProperty('SmartInput')
  expectTypeOf<EmailsHelpers>().not.toHaveProperty('Field')
})
