import type { FormValue } from 'coerce-form-data'
import { FormDataCoercionError, coerceValue, parseDate } from 'coerce-form-data'
import * as React from 'react'
import type {
  FieldValues,
  Path,
  UseFormRegister,
  UseFormRegisterReturn,
} from 'react-hook-form'
import { useFieldArray, useFormContext } from 'react-hook-form'
import type { ArraySchemaInfo, ObjectSchemaInfo, SchemaInfo } from 'schema-info'
import { mapChildren } from './children-traversal'
import type { ComponentSlots, PropsOf } from './defaults'
import { inferLabel } from './infer-label'
import type { FormSchema, Infer } from './prelude'

type StripDefaultProps<C, Keys extends string> = React.ComponentType<
  Omit<PropsOf<C>, Keys>
>
import { dotToBracket, mapObject } from './prelude'
import type { Field } from './schema-form'

type Option = { name: string } & Required<
  Pick<React.OptionHTMLAttributes<HTMLOptionElement>, 'value'>
>

type ScalarChildren<
  Schema extends FormSchema,
  Resolved extends ComponentSlots,
  Multiline extends ReadonlyArray<keyof Infer<Schema>>,
  Radio extends ReadonlyArray<keyof Infer<Schema>>,
  Hidden extends ReadonlyArray<keyof Infer<Schema>>,
  Name extends keyof Infer<Schema>,
  M extends boolean | undefined,
  R extends boolean | undefined,
  H extends boolean | undefined,
> = (
  helpers: Omit<Partial<Field<Infer<Schema>>>, 'name'> & {
    name: Name
    type?: JSX.IntrinsicElements['input']['type']
    Label: Resolved['label']
    SmartInput: React.ComponentType<
      SmartInputProps<Schema, Resolved, Multiline, Radio, Hidden, Name, M, R, H>
    >
    Input: StripDefaultProps<Resolved['input'], 'defaultValue'>
    FileInput: StripDefaultProps<Resolved['fileInput'], 'defaultValue'>
    Multiline: StripDefaultProps<Resolved['multiline'], 'defaultValue'>
    Select: StripDefaultProps<Resolved['select'], 'defaultValue'>
    Checkbox: StripDefaultProps<Resolved['checkbox'], 'defaultChecked'>
    RadioGroup: Resolved['radioGroup']
    RadioLabel: Resolved['radioLabel']
    Radio: StripDefaultProps<Resolved['radio'], 'defaultChecked'>
    CheckboxLabel: Resolved['checkboxLabel']
    Errors: Resolved['fieldErrors']
    Error: Resolved['error']
    ref: React.ForwardedRef<unknown>
  }
) => React.ReactNode

type ObjectChildren<
  Schema extends FormSchema,
  Resolved extends ComponentSlots,
  Name extends keyof Infer<Schema>,
> = (
  helpers: Omit<Partial<Field<Infer<Schema>>>, 'name'> & {
    name: Name
    Title: Resolved['objectTitle']
    Field: ScopedFieldComponent<NonNullable<Infer<Schema>[Name]>, Resolved>
    ObjectFields: Resolved['objectFields']
    Errors: Resolved['fieldErrors']
    Error: Resolved['error']
  }
) => React.ReactNode

type ArrayElement<T> = T extends readonly (infer E)[] ? E : never

type ArrayItem = {
  key: string
  index: number
}

type ScalarItemHelpers<Resolved extends ComponentSlots> = {
  SmartInput: React.ComponentType<SmartInputBaseProps>
  Label: Resolved['label']
  Input: StripDefaultProps<Resolved['input'], 'defaultValue'>
  FileInput: StripDefaultProps<Resolved['fileInput'], 'defaultValue'>
  Multiline: StripDefaultProps<Resolved['multiline'], 'defaultValue'>
  Select: StripDefaultProps<Resolved['select'], 'defaultValue'>
  Checkbox: StripDefaultProps<Resolved['checkbox'], 'defaultChecked'>
  RadioGroup: Resolved['radioGroup']
  RadioLabel: Resolved['radioLabel']
  Radio: StripDefaultProps<Resolved['radio'], 'defaultChecked'>
  CheckboxLabel: Resolved['checkboxLabel']
  Errors: Resolved['fieldErrors']
  Error: Resolved['error']
}

type ObjectItemHelpers<Elem, Resolved extends ComponentSlots> = {
  Field: ScopedFieldComponent<Elem, Resolved>
  Label: Resolved['label']
  Errors: Resolved['fieldErrors']
  Error: Resolved['error']
}

type ItemChildren<
  Elem,
  Resolved extends ComponentSlots,
> = IsObject<Elem> extends true
  ? (helpers: ObjectItemHelpers<NonNullable<Elem>, Resolved>) => React.ReactNode
  : (helpers: ScalarItemHelpers<Resolved>) => React.ReactNode

type ItemProps<Elem, Resolved extends ComponentSlots> = {
  children?: ItemChildren<Elem, Resolved>
  index?: number
}

type ScopedFieldComponent<T, Resolved extends ComponentSlots> = <
  Name extends keyof T,
>(
  props: ScopedFieldProps<T, Resolved, Name>
) => React.ReactElement | null

type ScopedFieldProps<
  T,
  Resolved extends ComponentSlots,
  Name extends keyof T,
> = {
  name: Name
  label?: string
  placeholder?: string
  autoComplete?: JSX.IntrinsicElements['input']['autoComplete']
  autoFocus?: boolean
  multiline?: boolean
  radio?: boolean
  hidden?: boolean
  accept?: string
  options?: Option[]
  value?: T[Name]
  type?: React.HTMLInputTypeAttribute
  fieldProps?: Omit<PropsOf<Resolved['field']>, 'children'>
  children?: ScopedChildren<T, Resolved, Name>
}

type ScopedChildren<
  T,
  Resolved extends ComponentSlots,
  Name extends keyof T,
> = IsObject<T[Name]> extends true
  ? ScopedObjectChildren<NonNullable<T[Name]>, Resolved>
  : IsArray<T[Name]> extends true
    ? ScopedArrayChildren<T[Name], Resolved>
    : ScopedScalarChildren<Resolved>

type ScopedObjectChildren<T, Resolved extends ComponentSlots> = (helpers: {
  Title: Resolved['objectTitle']
  Field: ScopedFieldComponent<T, Resolved>
  ObjectFields: Resolved['objectFields']
  Errors: Resolved['fieldErrors']
  Error: Resolved['error']
}) => React.ReactNode

type ScopedArrayChildren<V, Resolved extends ComponentSlots> = (helpers: {
  Title: Resolved['arrayTitle']
  Errors: Resolved['fieldErrors']
  Error: Resolved['error']
  items: ArrayItem[]
  Item: React.ComponentType<ItemProps<ArrayElement<V>, Resolved>>
  append: (value?: ArrayElement<V>) => void
  prepend: (value?: ArrayElement<V>) => void
  remove: (index: number) => void
  insert: (index: number, value?: ArrayElement<V>) => void
  move: (from: number, to: number) => void
  swap: (a: number, b: number) => void
  AddButton: Resolved['addButton']
  RemoveButton: Resolved['removeButton']
  ArrayEmpty: Resolved['arrayEmpty']
  ScalarArrayField: Resolved['scalarArrayField']
}) => React.ReactNode

type ScopedScalarChildren<Resolved extends ComponentSlots> = (helpers: {
  Label: Resolved['label']
  SmartInput: React.ComponentType<SmartInputBaseProps>
  Input: StripDefaultProps<Resolved['input'], 'defaultValue'>
  Errors: Resolved['fieldErrors']
  Error: Resolved['error']
}) => React.ReactNode

type ArrayChildren<
  Schema extends FormSchema,
  Resolved extends ComponentSlots,
  Name extends keyof Infer<Schema>,
> = (
  helpers: Omit<Partial<Field<Infer<Schema>>>, 'name'> & {
    name: Name
    Title: Resolved['arrayTitle']
    Errors: Resolved['fieldErrors']
    Error: Resolved['error']
    items: ArrayItem[]
    Item: React.ComponentType<
      ItemProps<ArrayElement<Infer<Schema>[Name]>, Resolved>
    >
    append: (value?: ArrayElement<Infer<Schema>[Name]>) => void
    prepend: (value?: ArrayElement<Infer<Schema>[Name]>) => void
    remove: (index: number) => void
    insert: (index: number, value?: ArrayElement<Infer<Schema>[Name]>) => void
    move: (from: number, to: number) => void
    swap: (a: number, b: number) => void
    AddButton: Resolved['addButton']
    RemoveButton: Resolved['removeButton']
    ArrayEmpty: Resolved['arrayEmpty']
    ScalarArrayField: Resolved['scalarArrayField']
  }
) => React.ReactNode

type Children<
  Schema extends FormSchema,
  Resolved extends ComponentSlots,
  Multiline extends ReadonlyArray<keyof Infer<Schema>>,
  Radio extends ReadonlyArray<keyof Infer<Schema>>,
  Hidden extends ReadonlyArray<keyof Infer<Schema>>,
  Name extends keyof Infer<Schema>,
  M extends boolean | undefined,
  R extends boolean | undefined,
  H extends boolean | undefined,
> = IsObject<Infer<Schema>[Name]> extends true
  ? ObjectChildren<Schema, Resolved, Name>
  : IsArray<Infer<Schema>[Name]> extends true
    ? ArrayChildren<Schema, Resolved, Name>
    : ScalarChildren<Schema, Resolved, Multiline, Radio, Hidden, Name, M, R, H>

type FieldType =
  | 'string'
  | 'boolean'
  | 'number'
  | 'date'
  | 'file'
  | 'array'
  | 'object'

const types: Record<FieldType, React.HTMLInputTypeAttribute> = {
  boolean: 'checkbox',
  string: 'text',
  number: 'text',
  date: 'date',
  file: 'file',
  array: 'text',
  object: 'text',
}

function getInputType(
  type: FieldType,
  radio: boolean
): React.HTMLInputTypeAttribute {
  if (radio) return 'radio'

  return types[type]
}

type FieldBaseProps<
  Schema extends FormSchema,
  Resolved extends ComponentSlots,
  Multiline extends ReadonlyArray<keyof Infer<Schema>>,
  Radio extends ReadonlyArray<keyof Infer<Schema>>,
  Hidden extends ReadonlyArray<keyof Infer<Schema>>,
  Name extends keyof Infer<Schema>,
  M extends boolean | undefined,
  R extends boolean | undefined,
  H extends boolean | undefined,
> = Omit<
  Partial<Field<Infer<Schema>>>,
  'name' | 'multiline' | 'radio' | 'hidden' | 'autoComplete'
> & {
  name: Name
  multiline?: M
  radio?: R
  hidden?: H
  children?: Children<Schema, Resolved, Multiline, Radio, Hidden, Name, M, R, H>
  fieldProps?: Omit<PropsOf<Resolved['field']>, 'children'>
  emptyArrayLabel?: string
}

type SmartInputInternalKeys =
  | 'registerProps'
  | 'a11yProps'
  | 'className'
  | 'defaultValue'
  | 'defaultChecked'

type FieldProps<
  Schema extends FormSchema,
  Resolved extends ComponentSlots,
  Multiline extends ReadonlyArray<keyof Infer<Schema>>,
  Radio extends ReadonlyArray<keyof Infer<Schema>>,
  Hidden extends ReadonlyArray<keyof Infer<Schema>>,
  Name extends keyof Infer<Schema>,
  M extends boolean | undefined,
  R extends boolean | undefined,
  H extends boolean | undefined,
> = FieldBaseProps<Schema, Resolved, Multiline, Radio, Hidden, Name, M, R, H> &
  Omit<
    SmartInputProps<Schema, Resolved, Multiline, Radio, Hidden, Name, M, R, H>,
    | keyof FieldBaseProps<
        Schema,
        Resolved,
        Multiline,
        Radio,
        Hidden,
        Name,
        M,
        R,
        H
      >
    | SmartInputInternalKeys
  >

type FieldComponent<
  Schema extends FormSchema,
  Resolved extends ComponentSlots,
  Multiline extends ReadonlyArray<keyof Infer<Schema>>,
  Radio extends ReadonlyArray<keyof Infer<Schema>>,
  Hidden extends ReadonlyArray<keyof Infer<Schema>>,
> = <
  Name extends keyof Infer<Schema>,
  const M extends boolean | undefined = undefined,
  const R extends boolean | undefined = undefined,
  const H extends boolean | undefined = undefined,
>(
  props: FieldProps<Schema, Resolved, Multiline, Radio, Hidden, Name, M, R, H>
) => React.ReactElement | null

type SmartInputBaseProps = {
  fieldType?: FieldType
  type?: React.HTMLInputTypeAttribute
  // biome-ignore lint/suspicious/noExplicitAny: passed to HTML defaultValue/defaultChecked — must accept any input value type
  value?: any
  autoFocus?: boolean
  autoComplete?: JSX.IntrinsicElements['input']['autoComplete']
  accept?: string
  options?: Option[]
  multiline?: boolean
  radio?: boolean
  placeholder?: string
  registerProps?: UseFormRegisterReturn
  className?: string
  a11yProps?: Record<`aria-${string}`, string | boolean | undefined>
}

type IsBoolean<T> = [NonNullable<T>] extends [boolean] ? true : false

type IsEnum<T> = [NonNullable<T>] extends [string]
  ? [string] extends [NonNullable<T>]
    ? false
    : true
  : false

type IsFile<T> = [NonNullable<T>] extends [File] ? true : false

type IsArray<T> = unknown extends T
  ? false
  : [NonNullable<T>] extends [readonly (infer _)[]]
    ? true
    : false

type IsObject<T> = unknown extends T
  ? false
  : IsArray<T> extends true
    ? false
    : IsFile<T> extends true
      ? false
      : IsBoolean<T> extends true
        ? false
        : [NonNullable<T>] extends [object]
          ? true
          : false

type SmartInputSlot<
  Schema extends FormSchema,
  Multiline extends ReadonlyArray<keyof Infer<Schema>>,
  Radio extends ReadonlyArray<keyof Infer<Schema>>,
  Hidden extends ReadonlyArray<keyof Infer<Schema>>,
  Name extends keyof Infer<Schema>,
  M extends boolean | undefined,
  R extends boolean | undefined,
  H extends boolean | undefined,
> = H extends true
  ? 'input'
  : Name extends unknown
    ? Name extends Hidden[number]
      ? 'input'
      : IsFile<Infer<Schema>[Name]> extends true
        ? 'fileInput'
        : IsBoolean<Infer<Schema>[Name]> extends true
          ? 'checkbox'
          : R extends true
            ? 'radio'
            : Name extends Radio[number]
              ? 'radio'
              : IsEnum<Infer<Schema>[Name]> extends true
                ? 'select'
                : M extends true
                  ? 'multiline'
                  : Name extends Multiline[number]
                    ? 'multiline'
                    : 'input'
    : never

type SmartInputProps<
  Schema extends FormSchema,
  Resolved extends ComponentSlots,
  Multiline extends ReadonlyArray<keyof Infer<Schema>>,
  Radio extends ReadonlyArray<keyof Infer<Schema>>,
  Hidden extends ReadonlyArray<keyof Infer<Schema>>,
  Name extends keyof Infer<Schema>,
  M extends boolean | undefined,
  R extends boolean | undefined,
  H extends boolean | undefined,
> = SmartInputBaseProps &
  Omit<
    Partial<
      PropsOf<
        Resolved[SmartInputSlot<
          Schema,
          Multiline,
          Radio,
          Hidden,
          Name,
          M,
          R,
          H
        >]
      >
    >,
    'defaultValue' | 'defaultChecked'
  >

const FieldContext = React.createContext<
  Partial<Omit<Field<never>, 'name'>> | undefined
>(undefined)

/**
 * Access information about the field currently being rendered.
 *
 * This hook is meant to be used from inside custom components passed to
 * {@link SchemaForm} or a render function. It exposes metadata such as the
 * computed label, validation errors and the coerced value so that custom
 * inputs can easily hook into the form.
 *
 * @returns Field data including `label`, `errors` and `value`.
 *
 * @example
 * ```tsx
 * const { label } = useField()
 * ```
 *
 * @example
 * ```tsx
 * const { errors } = useField()
 * ```
 */
export function useField() {
  const context = React.useContext(FieldContext)

  if (!context) {
    throw new Error(
      'useField() hook must be used within a Field component.\n' +
        'This hook provides access to field metadata and can only be called from components rendered inside:\n' +
        '  1. A custom Field component passed to SchemaForm\n' +
        '  2. A custom render function (renderScalarField, renderArrayField, etc.)\n' +
        '  3. Children of a Field component\n' +
        'Make sure your component is wrapped by a Field provider.'
    )
  }

  return context
}

const makeSelectOption = ({ name, value }: Option) => (
  <option key={String(value)} value={value}>
    {name}
  </option>
)

const makeOptionComponents = (
  fn: (option: Option) => JSX.Element,
  options: Option[] | undefined
) => (options ? options.map(fn) : undefined)

function createSmartInput(
  idPrefix: string,
  components: Pick<
    ComponentSlots,
    | 'input'
    | 'fileInput'
    | 'multiline'
    | 'select'
    | 'checkbox'
    | 'radio'
    | 'radioLabel'
  >
) {
  const {
    input: Input,
    fileInput: FileInput,
    multiline: Multiline,
    select: Select,
    checkbox: Checkbox,
    radio: Radio,
    radioLabel: RadioLabel,
  } = components

  return ({
    fieldType,
    type,
    value,
    autoFocus,
    autoComplete,
    accept,
    options,
    multiline,
    radio,
    placeholder,
    registerProps,
    a11yProps,
    ...props
  }: SmartInputBaseProps) => {
    if (!registerProps) return null

    const {
      defaultValue: _dv,
      defaultChecked: _dc,
      ...safeProps
    } = props as Record<string, unknown>

    const makeRadioOption =
      (props: Record<string, unknown>, checkedValue: Option['value']) =>
      ({ name, value }: Option) => {
        const propsWithUniqueId = mapObject(props, (key, propValue) =>
          key === 'id' ? [key, `${propValue}-${value}`] : [key, propValue]
        )
        return (
          <RadioLabel key={String(propsWithUniqueId?.id)}>
            <Radio
              type="radio"
              value={value}
              defaultChecked={value === checkedValue}
              {...propsWithUniqueId}
            />
            {name}
          </RadioLabel>
        )
      }

    const { name } = registerProps

    const commonProps = {
      id: `${idPrefix}${name}`,
      autoFocus,
      ...registerProps,
      ...safeProps,
    }

    const withAutoComplete = { ...commonProps, autoComplete }

    if (type === 'hidden') {
      return <Input type="hidden" defaultValue={value} {...commonProps} />
    }

    if (fieldType === 'file') {
      return (
        <FileInput
          type="file"
          accept={accept}
          {...commonProps}
          {...a11yProps}
        />
      )
    }

    return fieldType === 'boolean' ? (
      <Checkbox
        type="checkbox"
        placeholder={placeholder}
        defaultChecked={Boolean(value)}
        {...commonProps}
        {...a11yProps}
      />
    ) : options && !radio ? (
      <Select defaultValue={value} {...withAutoComplete} {...a11yProps}>
        {makeOptionComponents(makeSelectOption, options)}
      </Select>
    ) : options && radio ? (
      <>{makeOptionComponents(makeRadioOption(commonProps, value), options)}</>
    ) : multiline ? (
      <Multiline
        placeholder={placeholder}
        defaultValue={value}
        {...withAutoComplete}
        {...a11yProps}
      />
    ) : (
      <Input
        type={type}
        placeholder={placeholder}
        defaultValue={value}
        {...withAutoComplete}
        {...a11yProps}
      />
    )
  }
}

function defaultValue(info: SchemaInfo): unknown {
  if (info.getDefaultValue) return info.getDefaultValue()
  switch (info.type) {
    case 'string':
    case 'enum':
      return ''
    case 'number':
      return 0
    case 'boolean':
      return false
    case 'date':
      return undefined
    case 'file':
      return undefined
    case 'array':
      return []
    case 'object':
      return Object.fromEntries(
        Object.entries(info.fields).map(([key, fieldInfo]) => [
          key,
          defaultValue(fieldInfo),
        ])
      )
    default:
      return ''
  }
}

function fieldTypeFromInfo(info: SchemaInfo): FieldType {
  if (info.type === 'enum') return 'string'
  if (info.type === 'file') return 'file'
  if (info.type === 'array') return 'array'
  if (info.type === 'object') return 'object'
  return (info.type ?? 'string') as FieldType
}

// biome-ignore lint/suspicious/noExplicitAny: helper shape varies per field type (scalar/array/object children types)
type ChildrenRenderFn = (...args: any[]) => React.ReactNode

type FieldMetadata = {
  dirty?: boolean
  autoFocus?: boolean
  errors?: string[]
  fieldType: FieldType
  hidden?: boolean
  label?: string
  multiline?: boolean
  options?: Option[]
  placeholder?: string
  autoComplete?: JSX.IntrinsicElements['input']['autoComplete']
  radio?: boolean
  required?: boolean
  shape?: SchemaInfo
  // biome-ignore lint/suspicious/noExplicitAny: form field value passed to HTML defaultValue/defaultChecked
  value?: any
}

type InternalFieldBaseProps<S extends SchemaInfo = SchemaInfo> = {
  name: string
  label?: string
  shape: S
  errors?: string[]
  hidden?: boolean
  fieldProps?: Record<string, unknown>
  childrenFn?: ChildrenRenderFn
  field: FieldMetadata
  idPrefix: string
  components: ComponentSlots
  // biome-ignore lint/suspicious/noExplicitAny: forward ref to FieldRouter — concrete type resolved at runtime
  fieldRouter: React.ComponentType<any>
  renderFunctions: RenderFunctions
  defaultEmptyArrayLabel: string
  defaultAddButtonLabel: string
  defaultRemoveButtonLabel: string
}

type ArrayFieldInnerProps = InternalFieldBaseProps<ArraySchemaInfo> & {
  register: UseFormRegister<FieldValues>
  emptyArrayLabel: string
  addButtonLabel: string
  removeButtonLabel: string
}

type ObjectFieldInnerProps = InternalFieldBaseProps<ObjectSchemaInfo>

function ArrayFieldInner(props: ArrayFieldInnerProps) {
  const {
    name,
    label,
    shape,
    errors,
    hidden,
    fieldProps,
    childrenFn,
    field: fieldMeta,
    idPrefix,
    components: c,
    fieldRouter: Router,
    register,
    emptyArrayLabel,
    addButtonLabel,
    removeButtonLabel,
    renderFunctions: rf,
    defaultEmptyArrayLabel,
    defaultAddButtonLabel,
    defaultRemoveButtonLabel,
  } = props

  const FieldWrapper = c.field
  const Label = c.label
  const ArrayTitle = c.arrayTitle
  const Errors = c.fieldErrors
  const Error = c.error
  const ScalarArrayFieldComp = c.scalarArrayField
  const ScalarArrayItemComp = c.scalarArrayItem
  const ObjectArrayItemComp = c.objectArrayItem
  const ArrayArrayItemComp = c.arrayArrayItem
  const AddButton = c.addButton
  const RemoveButton = c.removeButton
  const ArrayEmptyComp = c.arrayEmpty

  const { control } = useFormContext()
  const {
    fields: rhfFields,
    append,
    prepend,
    remove,
    insert,
    move,
    swap,
  } = useFieldArray({ control, name: String(name) })

  const itemShape = shape.item as SchemaInfo
  const objectItemShape = itemShape.type === 'object' ? itemShape : undefined
  const arrayHtmlName = dotToBracket(String(name))
  const labelId = `${idPrefix}label-for-${arrayHtmlName}`
  const errorsId = `${idPrefix}errors-for-${arrayHtmlName}`

  const errorsChildren = errors?.length
    ? errors.map((error: string) => <Error key={error}>{error}</Error>)
    : undefined

  const { style: userStyle, ...restFieldProps } = fieldProps ?? {}
  const mergedStyle = hidden
    ? { display: 'none' as const, ...(userStyle as React.CSSProperties) }
    : (userStyle as React.CSSProperties | undefined)

  const asFieldArrayValue = (v: unknown) => (Array.isArray(v) ? [v] : v)
  const isScalarItem = itemShape.type !== 'object' && itemShape.type !== 'array'
  const scalarFocusName = (index: number) =>
    isScalarItem ? `${String(name)}.${index}` : undefined
  const appendDefault = (value?: unknown) =>
    append(asFieldArrayValue(value ?? defaultValue(itemShape)), {
      focusName: scalarFocusName(rhfFields.length),
    })
  const prependDefault = (value?: unknown) =>
    prepend(asFieldArrayValue(value ?? defaultValue(itemShape)), {
      focusName: scalarFocusName(0),
    })
  const insertDefault = (index: number, value?: unknown) =>
    insert(index, asFieldArrayValue(value ?? defaultValue(itemShape)), {
      focusName: scalarFocusName(index),
    })

  // Per-nesting-level components (stable via useMemo)
  const ChildSmartInput = React.useMemo(
    () => createSmartInput(idPrefix, c),
    [idPrefix, c]
  )

  const ScopedItemField = React.useMemo(
    () =>
      React.forwardRef(
        // biome-ignore lint/suspicious/noExplicitAny: scoped field wraps FieldRouter
        ({ itemName, ...subProps }: Record<string, any>, subRef) => {
          if (!objectItemShape) return null
          const { getFieldState } = useFormContext()
          const subKey = String(subProps.name)
          const subShape = objectItemShape.fields[subKey]
          if (!subShape) return null
          const subName = `${itemName}.${subKey}`
          const subError = getFieldState(subName)?.error
          const subErrors = subError?.message ? [subError.message] : undefined
          const subRequired = !(subShape.optional || subShape.nullable)
          const subOptions = subShape.enumValues?.map((v: string) => ({
            name: inferLabel(v),
            value: v,
          }))
          const resolvedProps = {
            ...subProps,
            name: subName,
            shape: subShape,
            fieldType: fieldTypeFromInfo(subShape),
            label: subProps.label ?? inferLabel(subKey),
            required: subRequired,
            options: subProps.options ?? subOptions,
            errors: subErrors,
          }
          if (!subProps.children) {
            const ft = fieldTypeFromInfo(subShape)
            const renderProps = { Field: Router, ref: subRef, ...resolvedProps }
            if (ft === 'array') {
              return rf.renderArrayField({
                ...renderProps,
                emptyArrayLabel: defaultEmptyArrayLabel,
                addButtonLabel: defaultAddButtonLabel,
                removeButtonLabel: defaultRemoveButtonLabel,
              })
            }
            if (ft === 'object') return rf.renderObjectField(renderProps)
            return rf.renderScalarField(renderProps)
          }
          return React.createElement(Router, {
            ref: subRef,
            ...resolvedProps,
          })
        }
      ),
    [objectItemShape, Router]
  )

  const Item = React.useMemo(
    () =>
      function Item({
        index = 0,
        children: itemChildrenFn,
      }: {
        index?: number
        children?: ChildrenRenderFn
      }) {
        const itemName = `${String(name)}.${index}`
        const itemHtmlName = dotToBracket(itemName)
        const { getFieldState } = useFormContext()
        const itemError = getFieldState(itemName)?.error
        const itemErrors = itemError?.message ? [itemError.message] : undefined

        const itemLabelId = `${idPrefix}label-for-${itemHtmlName}`
        const itemErrorsId = `${idPrefix}errors-for-${itemHtmlName}`
        const itemErrorsChildren = itemErrors?.length
          ? itemErrors.map((e: string) => <Error key={e}>{e}</Error>)
          : undefined

        let registerRef: React.Ref<unknown> | undefined
        let itemRegisterProps: Record<string, unknown> | undefined
        let itemA11y: Record<string, unknown> | undefined
        let itemFieldType: FieldType | undefined
        let itemType: React.HTMLInputTypeAttribute | undefined
        let itemOptions: Option[] | undefined
        if (itemShape.type !== 'object' && itemShape.type !== 'array') {
          const scalarShape = itemShape
          const { ref, ...rawRegisterProps } = register(itemName, {
            setValueAs: (value: unknown) => {
              try {
                return coerceValue(
                  value as FormValue,
                  scalarShape ?? {
                    type: null,
                    optional: false,
                    nullable: false,
                  }
                )
              } catch (error) {
                if (error instanceof FormDataCoercionError) return null
                throw error
              }
            },
          })
          registerRef = ref
          itemRegisterProps = { ...rawRegisterProps, name: itemHtmlName }
          itemFieldType = fieldTypeFromInfo(scalarShape)
          itemType = getInputType(itemFieldType, false)
          itemOptions = scalarShape.enumValues?.map((v: string) => ({
            name: inferLabel(v),
            value: v,
          }))
          itemA11y = {
            'aria-labelledby': labelId,
            'aria-invalid': Boolean(itemErrors),
            'aria-describedby': itemErrors ? itemErrorsId : undefined,
            'aria-required': !(scalarShape.optional || scalarShape.nullable),
          }
        }

        const ItemWrapper =
          itemShape.type === 'object'
            ? ObjectArrayItemComp
            : itemShape.type === 'array'
              ? ArrayArrayItemComp
              : ScalarArrayItemComp

        if (!itemChildrenFn) {
          if (itemShape.type === 'object') {
            const subFieldKeys = Object.keys(itemShape.fields)
            return (
              <ItemWrapper>
                {subFieldKeys.map((subKey) => {
                  const subShape = itemShape.fields[subKey]
                  const subName = `${itemName}.${subKey}`
                  const subError = getFieldState(subName)?.error
                  const subErrors = subError?.message
                    ? [subError.message]
                    : undefined
                  const subRequired = !(subShape.optional || subShape.nullable)
                  const subOptions = subShape.enumValues?.map((v: string) => ({
                    name: inferLabel(v),
                    value: v,
                  }))
                  return React.createElement(Router, {
                    key: subKey,
                    name: subName,
                    shape: subShape,
                    fieldType: fieldTypeFromInfo(subShape),
                    label: inferLabel(subKey),
                    required: subRequired,
                    errors: subErrors,
                    options: subOptions,
                  })
                })}
                <RemoveButton onClick={() => remove(index)}>
                  {removeButtonLabel}
                </RemoveButton>
              </ItemWrapper>
            )
          }

          if (itemShape.type === 'array') {
            return (
              <ItemWrapper>
                {React.createElement(Router, {
                  name: itemName,
                  shape: itemShape,
                  fieldType: 'array' as FieldType,
                  label: inferLabel(String(index)),
                  required: !(itemShape.optional || itemShape.nullable),
                  errors: itemErrors,
                })}
                <RemoveButton onClick={() => remove(index)}>
                  {removeButtonLabel}
                </RemoveButton>
              </ItemWrapper>
            )
          }

          const smartInputProps = {
            fieldType: itemFieldType,
            type: itemType,
            options: itemOptions,
            value: '',
            registerProps: { ref: registerRef, ...itemRegisterProps },
            a11yProps: itemA11y,
          }

          return (
            <ItemWrapper>
              <ScalarArrayFieldComp>
                {React.createElement(
                  ChildSmartInput,
                  smartInputProps as SmartInputBaseProps
                )}
                {Boolean(itemErrorsChildren) && (
                  <Errors role="alert" id={itemErrorsId}>
                    {itemErrorsChildren}
                  </Errors>
                )}
              </ScalarArrayFieldComp>
              <RemoveButton onClick={() => remove(index)}>
                {removeButtonLabel}
              </RemoveButton>
            </ItemWrapper>
          )
        }

        const helpers =
          itemShape.type === 'object'
            ? {
                Field: ScopedItemField,
                Label: Label,
                Errors: Errors,
                Error,
              }
            : {
                SmartInput: ChildSmartInput,
                Label: Label,
                Errors: Errors,
                Error,
                Input: c.input,
                FileInput: c.fileInput,
                Multiline: c.multiline,
                Select: c.select,
                Checkbox: c.checkbox,
                Radio: c.radio,
                RadioGroup: c.radioGroup,
                RadioLabel: c.radioLabel,
                CheckboxLabel: c.checkboxLabel,
              }

        const childrenDefinition = itemChildrenFn(helpers)

        const mappedChildren = mapChildren(childrenDefinition, (child) => {
          if (child.type === ChildSmartInput) {
            return React.cloneElement(child, {
              fieldType: itemFieldType,
              type: itemType,
              value: '',
              options: itemOptions,
              registerProps: { ref: registerRef, ...itemRegisterProps },
              a11yProps: itemA11y,
              ...child.props,
            })
          }
          if (child.type === Label) {
            return React.cloneElement(child, {
              id: itemLabelId,
              children: label,
              ...child.props,
            })
          }
          if (child.type === Errors) {
            if (!child.props.children && !itemErrorsChildren) return null
            return React.cloneElement(child, {
              id: itemErrorsId,
              role: 'alert',
              children: itemErrorsChildren,
              ...child.props,
            })
          }
          if (child.type === ScopedItemField) {
            return React.cloneElement(child, {
              itemName,
              ...child.props,
            })
          }
          if (child.type === AddButton) {
            return React.cloneElement(child, {
              children: addButtonLabel,
              ...child.props,
            })
          }
          if (child.type === RemoveButton) {
            return React.cloneElement(child, {
              children: removeButtonLabel,
              ...child.props,
            })
          }
          return child
        })

        return <ItemWrapper>{mappedChildren}</ItemWrapper>
      },
    [name, idPrefix]
  )

  if (childrenFn) {
    const items = rhfFields.map((rhfField, index) => ({
      key: rhfField.id,
      index,
    }))

    const childrenDefinition = (childrenFn as ChildrenRenderFn)({
      name,
      Title: ArrayTitle,
      Errors,
      Error,
      items,
      Item,
      append: appendDefault,
      prepend: prependDefault,
      remove,
      insert: insertDefault,
      move,
      swap,
      AddButton,
      RemoveButton,
      ArrayEmpty: ArrayEmptyComp,
      ScalarArrayField: ScalarArrayFieldComp,
      ...fieldMeta,
    })

    let itemIndex = 0
    const children = mapChildren(childrenDefinition, (child) => {
      if (child.type === ArrayTitle) {
        return React.cloneElement(child, {
          id: labelId,
          children: label,
          ...child.props,
        })
      }
      if (child.type === Errors) {
        if (!child.props.children && !errorsChildren) return null
        return React.cloneElement(child, {
          id: errorsId,
          role: 'alert',
          children: errorsChildren,
          ...child.props,
        })
      }
      if (child.type === AddButton) {
        return React.cloneElement(child, {
          children: addButtonLabel,
          ...child.props,
        })
      }
      if (child.type === RemoveButton) {
        return React.cloneElement(child, {
          children: removeButtonLabel,
          ...child.props,
        })
      }
      if (child.type === Item) {
        const idx = child.props.index ?? itemIndex
        itemIndex++
        return React.cloneElement(child, {
          index: idx,
          ...child.props,
        })
      }
      return child
    })

    return (
      <FieldContext.Provider value={fieldMeta}>
        <FieldWrapper hidden={hidden} style={mergedStyle} {...restFieldProps}>
          {children}
        </FieldWrapper>
      </FieldContext.Provider>
    )
  }

  return (
    <FieldContext.Provider value={fieldMeta}>
      <FieldWrapper hidden={hidden} style={mergedStyle} {...restFieldProps}>
        <ArrayTitle id={labelId}>{label}</ArrayTitle>
        {rhfFields.length === 0 && (
          <ArrayEmptyComp>{emptyArrayLabel}</ArrayEmptyComp>
        )}
        {rhfFields.map((rhfField, index) => {
          const itemRenderFn =
            itemShape.type === 'object'
              ? rf.renderObjectArrayItem
              : itemShape.type === 'array'
                ? rf.renderArrayArrayItem
                : rf.renderScalarArrayItem
          const rendered = itemRenderFn({
            Item,
            itemKey: rhfField.id,
            index,
            RemoveButton,
            remove,
            move,
            swap,
          })
          return mapChildren(rendered, (child) => {
            if (child.type === Item) {
              return React.cloneElement(child, {
                index: child.props.index ?? index,
                ...child.props,
              })
            }
            return child
          })
        })}
        <AddButton onClick={() => appendDefault()}>{addButtonLabel}</AddButton>
        {Boolean(errorsChildren) && (
          <Errors role="alert" id={errorsId}>
            {errorsChildren}
          </Errors>
        )}
      </FieldWrapper>
    </FieldContext.Provider>
  )
}

function ObjectFieldInner(props: ObjectFieldInnerProps) {
  const {
    name,
    label,
    shape,
    errors,
    hidden,
    fieldProps,
    childrenFn,
    field,
    idPrefix,
    components: c,
    fieldRouter: FieldRouter,
    renderFunctions: rf,
    defaultEmptyArrayLabel,
    defaultAddButtonLabel,
    defaultRemoveButtonLabel,
  } = props

  const Field = c.field
  const ObjectTitle = c.objectTitle
  const Errors = c.fieldErrors
  const Error = c.error
  const ObjectFieldsComp = c.objectFields
  const subFields = Object.keys(shape.fields)

  const { getFieldState: getSubFieldState } = useFormContext()
  const errorsFor = (path: string): string[] | undefined => {
    const { error } = getSubFieldState(path)
    return error?.message ? [error.message] : undefined
  }

  const errorsChildren = errors?.length
    ? errors.map((error: string) => <Error key={error}>{error}</Error>)
    : undefined

  const { style: userStyle, ...restFieldProps } = fieldProps ?? {}
  const mergedStyle = hidden
    ? { display: 'none' as const, ...(userStyle as React.CSSProperties) }
    : (userStyle as React.CSSProperties | undefined)

  const htmlName = dotToBracket(String(name))
  const labelId = `${idPrefix}label-for-${htmlName}`
  const errorsId = `${idPrefix}errors-for-${htmlName}`

  const ScopedField = React.useMemo(
    () =>
      // biome-ignore lint/suspicious/noExplicitAny: scoped field wraps the outer FieldRouter
      React.forwardRef((subProps: Record<string, any>, subRef) => {
        const { getFieldState } = useFormContext()
        const subKey = String(subProps.name)
        const subShape = shape.fields[subKey]
        if (!subShape) return null
        const subName = `${String(name)}.${subKey}`
        const subError = getFieldState(subName)?.error
        const subErrors = subError?.message ? [subError.message] : undefined
        const subRequired = !(subShape.optional || subShape.nullable)
        const subOptions = subShape.enumValues?.map((v: string) => ({
          name: inferLabel(v),
          value: v,
        }))
        const resolvedProps = {
          ...subProps,
          name: subName,
          shape: subShape,
          fieldType: fieldTypeFromInfo(subShape),
          label: subProps.label ?? inferLabel(subKey),
          required: subRequired,
          options: subProps.options ?? subOptions,
          errors: subErrors,
        }
        if (!subProps.children) {
          const ft = fieldTypeFromInfo(subShape)
          const renderProps = {
            Field: FieldRouter,
            ref: subRef,
            ...resolvedProps,
          }
          if (ft === 'array') {
            return rf.renderArrayField({
              ...renderProps,
              emptyArrayLabel: defaultEmptyArrayLabel,
              addButtonLabel: defaultAddButtonLabel,
              removeButtonLabel: defaultRemoveButtonLabel,
            })
          }
          if (ft === 'object') return rf.renderObjectField(renderProps)
          return rf.renderScalarField(renderProps)
        }
        return React.createElement(FieldRouter, {
          ref: subRef,
          ...resolvedProps,
        })
      }),
    [name, shape, FieldRouter]
  )

  if (childrenFn) {
    const childrenDefinition = (childrenFn as ChildrenRenderFn)({
      name,
      Title: ObjectTitle,
      Field: ScopedField,
      ObjectFields: ObjectFieldsComp,
      Errors,
      Error,
      ...field,
    })

    const children = mapChildren(childrenDefinition, (child) => {
      if (child.type === ObjectTitle) {
        return React.cloneElement(child, {
          id: labelId,
          children: label,
          ...child.props,
        })
      }
      if (child.type === Errors) {
        if (!child.props.children && !errorsChildren) return null
        return React.cloneElement(child, {
          id: errorsId,
          role: 'alert',
          children: errorsChildren,
          ...child.props,
        })
      }
      return child
    })

    return (
      <FieldContext.Provider value={field}>
        <Field style={mergedStyle} {...restFieldProps}>
          {children}
        </Field>
      </FieldContext.Provider>
    )
  }

  return (
    <FieldContext.Provider value={field}>
      <Field style={mergedStyle} {...restFieldProps}>
        <ObjectTitle id={labelId}>{label}</ObjectTitle>
        <ObjectFieldsComp>
          {subFields.map((subKey) => {
            const subShape = shape.fields[subKey]
            const subName = `${String(name)}.${subKey}`
            const subRequired = !(subShape.optional || subShape.nullable)
            const subOptions = subShape.enumValues?.map((v: string) => ({
              name: inferLabel(v),
              value: v,
            }))
            const ft = fieldTypeFromInfo(subShape)
            const renderProps = {
              Field: FieldRouter,
              name: subName,
              shape: subShape,
              fieldType: ft,
              label: inferLabel(subKey),
              required: subRequired,
              errors: errorsFor(subName),
              options: subOptions,
            }
            const rendered =
              ft === 'array'
                ? rf.renderArrayField({
                    ...renderProps,
                    emptyArrayLabel: defaultEmptyArrayLabel,
                    addButtonLabel: defaultAddButtonLabel,
                    removeButtonLabel: defaultRemoveButtonLabel,
                  })
                : ft === 'object'
                  ? rf.renderObjectField(renderProps)
                  : rf.renderScalarField(renderProps)
            return React.cloneElement(rendered, {
              key: rendered.key ?? subName,
            })
          })}
        </ObjectFieldsComp>
        {Boolean(errorsChildren) && (
          <Errors role="alert" id={errorsId}>
            {errorsChildren}
          </Errors>
        )}
      </Field>
    </FieldContext.Provider>
  )
}

// biome-ignore lint/suspicious/noExplicitAny: internal type — generics are for the external API
type RenderFn = (props: Record<string, any>) => JSX.Element

type RenderFunctions = {
  renderScalarField: RenderFn
  renderArrayField: RenderFn
  renderObjectField: RenderFn
  renderScalarArrayItem: RenderFn
  renderObjectArrayItem: RenderFn
  renderArrayArrayItem: RenderFn
}

function createField<
  Schema extends FormSchema,
  Resolved extends ComponentSlots,
  Multiline extends ReadonlyArray<keyof Infer<Schema>>,
  Radio extends ReadonlyArray<keyof Infer<Schema>>,
  Hidden extends ReadonlyArray<keyof Infer<Schema>>,
>({
  register,
  idPrefix,
  components,
  renderFunctions,
  emptyArrayLabel: defaultEmptyArrayLabel = 'No items',
  addButtonLabel: defaultAddButtonLabel = 'Add',
  removeButtonLabel: defaultRemoveButtonLabel = 'Remove',
}: {
  register: UseFormRegister<Infer<Schema>>
  idPrefix: string
  components: Resolved
  renderFunctions: RenderFunctions
  emptyArrayLabel?: string
  addButtonLabel?: string
  removeButtonLabel?: string
}): FieldComponent<Schema, Resolved, Multiline, Radio, Hidden> {
  // biome-ignore lint/suspicious/noExplicitAny: forward reference for recursive field rendering (objects/arrays render nested fields)
  const FieldRouter: { current: React.ComponentType<any> | null } = {
    current: null,
  }

  const c = components as ComponentSlots
  const Field = c.field
  const Label = c.label
  const Input = c.input
  const FileInput = c.fileInput
  const Multiline = c.multiline
  const Select = c.select
  const Radio = c.radio
  const Checkbox = c.checkbox
  const CheckboxLabel = c.checkboxLabel
  const RadioGroup = c.radioGroup
  const RadioLabel = c.radioLabel
  const Errors = c.fieldErrors
  const Error = c.error

  const result = React.forwardRef(
    (
      {
        fieldType = 'string',
        shape,
        name,
        label,
        options,
        errors,
        dirty,
        type: typeProp,
        required = false,
        autoFocus = false,
        value: rawValue,
        multiline = false,
        radio = false,
        placeholder,
        hidden = false,
        autoComplete,
        accept,
        children: childrenFn,
        fieldProps,
        emptyArrayLabel = 'No items',
        addButtonLabel = 'Add',
        removeButtonLabel = 'Remove',
        ...smartInputExtra
      }: // biome-ignore lint/suspicious/noExplicitAny: internal implementation — generics are for the external API
      Record<string, any>,
      ref
    ) => {
      const value =
        fieldType === 'file'
          ? undefined
          : fieldType === 'date'
            ? parseDate(rawValue)
            : rawValue
      const field = {
        dirty,
        autoFocus,
        errors,
        fieldType,
        hidden,
        label,
        multiline,
        options,
        placeholder,
        autoComplete,
        radio,
        required,
        shape,
        value,
      }

      const errorsChildren = errors?.length
        ? errors.map((error: string) => <Error key={error}>{error}</Error>)
        : undefined

      const { style: userStyle, ...restFieldProps } = fieldProps ?? {}
      const mergedStyle = hidden
        ? { display: 'none' as const, ...userStyle }
        : userStyle

      const htmlName = dotToBracket(String(name))
      const labelId = `${idPrefix}label-for-${htmlName}`
      const errorsId = `${idPrefix}errors-for-${htmlName}`

      if (fieldType === 'array' && shape?.type === 'array') {
        return (
          <ArrayFieldInner
            name={name}
            label={label}
            shape={shape}
            errors={errors}
            hidden={hidden}
            fieldProps={fieldProps}
            childrenFn={childrenFn}
            field={field}
            idPrefix={idPrefix}
            components={c}
            emptyArrayLabel={emptyArrayLabel}
            addButtonLabel={addButtonLabel}
            removeButtonLabel={removeButtonLabel}
            // biome-ignore lint/suspicious/noExplicitAny: FieldRouter is the outer component
            fieldRouter={FieldRouter.current as React.ComponentType<any>}
            register={register as UseFormRegister<FieldValues>}
            renderFunctions={renderFunctions}
            defaultEmptyArrayLabel={defaultEmptyArrayLabel}
            defaultAddButtonLabel={defaultAddButtonLabel}
            defaultRemoveButtonLabel={defaultRemoveButtonLabel}
          />
        )
      }

      if (fieldType === 'object' && shape?.type === 'object') {
        return (
          <ObjectFieldInner
            name={name}
            label={label}
            shape={shape}
            errors={errors}
            hidden={hidden}
            fieldProps={fieldProps}
            childrenFn={childrenFn}
            field={field}
            idPrefix={idPrefix}
            components={c}
            // biome-ignore lint/suspicious/noExplicitAny: FieldRouter is the outer component
            fieldRouter={FieldRouter.current as React.ComponentType<any>}
            renderFunctions={renderFunctions}
            defaultEmptyArrayLabel={defaultEmptyArrayLabel}
            defaultAddButtonLabel={defaultAddButtonLabel}
            defaultRemoveButtonLabel={defaultRemoveButtonLabel}
          />
        )
      }

      const type =
        typeProp ?? (hidden ? 'hidden' : getInputType(fieldType, radio))

      const { ref: registerRef, ...rawRegisterProps } = register(
        String(name) as Path<Infer<Schema>>,
        {
          setValueAs:
            fieldType === 'file'
              ? undefined
              : (value) => {
                  try {
                    return coerceValue(
                      value,
                      shape ?? { type: null, optional: false, nullable: false }
                    )
                  } catch (error) {
                    if (error instanceof FormDataCoercionError) return null
                    throw error
                  }
                },
        }
      )
      const registerProps = { ...rawRegisterProps, name: htmlName }

      const a11yProps = {
        'aria-labelledby': labelId,
        'aria-invalid': Boolean(errors),
        'aria-describedby': errors ? errorsId : undefined,
        'aria-required': required,
      }

      const SmartInput = React.useMemo(
        () => createSmartInput(idPrefix, c),
        [idPrefix]
      )

      if (childrenFn) {
        const childrenDefinition = (childrenFn as ChildrenRenderFn)({
          Label,
          SmartInput,
          Input,
          FileInput,
          Multiline,
          Select,
          Checkbox,
          Radio,
          RadioGroup,
          RadioLabel,
          CheckboxLabel,
          Errors,
          Error,
          ref,
          name,
          type,
          ...field,
        })

        const children = mapChildren(childrenDefinition, (child) => {
          const mergedRef = (instance: unknown) => {
            registerRef(instance)
            const childRef = (child as { ref?: { current: unknown } }).ref
            if (childRef) {
              childRef.current = instance
            }
          }

          if (child.type === Label) {
            return React.cloneElement(child, {
              id: labelId,
              htmlFor: `${idPrefix}${htmlName}`,
              children: label,
              ...child.props,
            })
          }
          if (child.type === SmartInput) {
            const smartInputProps = {
              fieldType,
              type,
              options: options,
              multiline,
              radio,
              placeholder,
              accept,
              registerProps: { ...registerProps, ref: mergedRef },
              autoFocus,
              autoComplete,
              value,
              a11yProps,
            }

            const {
              defaultValue: _sdv,
              defaultChecked: _sdc,
              ...smartChildProps
            } = child.props
            return React.cloneElement(child, {
              ...smartInputExtra,
              ...smartInputProps,
              ...smartChildProps,
            })
          }
          if (child.type === Input) {
            const { defaultValue: _, ...inputProps } = child.props
            return React.cloneElement(child, {
              id: `${idPrefix}${htmlName}`,
              type,
              ...registerProps,
              ...a11yProps,
              placeholder,
              autoFocus,
              autoComplete,
              defaultValue: value,
              ...inputProps,
              ref: mergedRef,
            })
          }
          if (child.type === FileInput) {
            return React.cloneElement(child, {
              id: `${idPrefix}${htmlName}`,
              type: 'file',
              accept: child.props.accept ?? accept,
              ...registerProps,
              ...a11yProps,
              autoFocus,
              ...child.props,
              ref: mergedRef,
            })
          }
          if (child.type === Multiline) {
            const { defaultValue: _, ...multilineProps } = child.props
            return React.cloneElement(child, {
              id: `${idPrefix}${htmlName}`,
              ...registerProps,
              ...a11yProps,
              placeholder,
              autoFocus,
              autoComplete,
              defaultValue: value,
              ...multilineProps,
              ref: mergedRef,
            })
          }
          if (child.type === Select) {
            const { defaultValue: _, ...selectProps } = child.props
            return React.cloneElement(child, {
              id: `${idPrefix}${htmlName}`,
              ...registerProps,
              ...a11yProps,
              autoFocus,
              autoComplete,
              defaultValue: value,
              children: makeOptionComponents(makeSelectOption, options),
              ...selectProps,
              ref: mergedRef,
            })
          }
          if (
            child.type === Checkbox &&
            ((child.type as unknown) !== 'input' ||
              child.props.type === 'checkbox')
          ) {
            const { defaultChecked: _, ...checkboxProps } = child.props
            return React.cloneElement(child, {
              id: `${idPrefix}${htmlName}`,
              type,
              autoFocus,
              ...registerProps,
              ...a11yProps,
              placeholder,
              defaultChecked: Boolean(value),
              ...checkboxProps,
              ref: mergedRef,
            })
          }
          if (child.type === RadioGroup) {
            return React.cloneElement(child, {
              ...a11yProps,
              ...child.props,
            })
          }
          if (
            child.type === Radio &&
            ((child.type as unknown) !== 'input' ||
              child.props.type === 'radio')
          ) {
            const { defaultChecked: _, ...radioProps } = child.props
            return React.cloneElement(child, {
              id: `${idPrefix}${htmlName}-${radioProps.value}`,
              type: 'radio',
              autoFocus,
              ...registerProps,
              defaultChecked: value === radioProps.value,
              ...radioProps,
              ref: mergedRef,
            })
          }
          if (child.type === CheckboxLabel) {
            return React.cloneElement(child, {
              id: labelId,
              children: label,
              ...child.props,
            })
          }
          if (child.type === Errors) {
            if (!child.props.children && !errors?.length) return null

            if (child.props.children || !errors?.length) {
              return React.cloneElement(child, {
                id: errorsId,
                role: 'alert',
                ...child.props,
              })
            }

            return React.cloneElement(child, {
              id: errorsId,
              role: 'alert',
              children: errorsChildren,
              ...child.props,
            })
          }
          return child
        })

        return (
          <FieldContext.Provider value={field}>
            <Field hidden={hidden} style={mergedStyle} {...restFieldProps}>
              {children}
            </Field>
          </FieldContext.Provider>
        )
      }

      const smartInput = (
        <SmartInput
          fieldType={fieldType}
          type={type}
          options={options}
          multiline={multiline}
          radio={radio}
          placeholder={placeholder}
          accept={accept}
          registerProps={{ ref: registerRef, ...registerProps }}
          autoFocus={autoFocus}
          autoComplete={autoComplete}
          value={value}
          a11yProps={a11yProps}
          {...smartInputExtra}
        />
      )

      return (
        <FieldContext.Provider value={field}>
          <Field hidden={hidden} style={mergedStyle} {...restFieldProps}>
            {fieldType === 'boolean' ? (
              <CheckboxLabel id={labelId}>
                {smartInput}
                {label}
              </CheckboxLabel>
            ) : radio ? (
              <>
                <Label id={labelId}>{label}</Label>
                <RadioGroup {...a11yProps}>{smartInput}</RadioGroup>
              </>
            ) : (
              <>
                <Label id={labelId} htmlFor={`${idPrefix}${htmlName}`}>
                  {label}
                </Label>
                {smartInput}
              </>
            )}
            {Boolean(errorsChildren) && (
              <Errors role="alert" id={errorsId}>
                {errorsChildren}
              </Errors>
            )}
          </Field>
        </FieldContext.Provider>
      )
    }
  ) as unknown as FieldComponent<Schema, Resolved, Multiline, Radio, Hidden>

  FieldRouter.current = result
  return result
}

export type {
  FieldType,
  FieldComponent,
  ScopedFieldComponent,
  Option,
  SmartInputProps,
  SmartInputSlot,
  SmartInputInternalKeys,
  StripDefaultProps,
  IsBoolean,
  IsEnum,
  IsFile,
  IsArray,
  IsObject,
}
export { createField }
