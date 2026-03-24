import { FormDataCoercionError, coerceValue, parseDate } from 'coerce-form-data'
import * as React from 'react'
import type { UseFormRegister, UseFormRegisterReturn } from 'react-hook-form'
import { findElement, findParent, mapChildren } from './children-traversal'
import type { PropsOf } from './defaults'
import type { FormSchema, Infer } from './prelude'
import { mapObject } from './prelude'
import type { Field } from './schema-form'

type Option = { name: string } & Required<
  Pick<React.OptionHTMLAttributes<HTMLOptionElement>, 'value'>
>

type Children<
  Schema extends FormSchema,
  // biome-ignore lint/suspicious/noExplicitAny: resolved map varies per call site
  Resolved extends Record<string, any>,
  Multiline extends ReadonlyArray<keyof Infer<Schema>>,
  Radio extends ReadonlyArray<keyof Infer<Schema>>,
  Name extends keyof Infer<Schema>,
  M extends boolean | undefined,
  R extends boolean | undefined,
> = (
  helpers: Omit<Partial<Field<Infer<Schema>>>, 'name'> & {
    name: Name
    type?: JSX.IntrinsicElements['input']['type']
    Label: Resolved['label']
    SmartInput: React.ComponentType<
      SmartInputProps<Schema, Resolved, Multiline, Radio, Name, M, R>
    >
    Input: Resolved['input']
    Multiline: Resolved['multiline']
    Select: Resolved['select']
    Checkbox: Resolved['checkbox']
    RadioGroup: Resolved['radioGroup']
    RadioWrapper: Resolved['radioWrapper']
    Radio: Resolved['radio']
    CheckboxWrapper: Resolved['checkboxWrapper']
    Errors: Resolved['fieldErrors']
    Error: Resolved['error']
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    ref: React.ForwardedRef<any>
  }
) => React.ReactNode

type FieldType = 'string' | 'boolean' | 'number' | 'date'

const types: Record<FieldType, React.HTMLInputTypeAttribute> = {
  boolean: 'checkbox',
  string: 'text',
  number: 'text',
  date: 'date',
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
  // biome-ignore lint/suspicious/noExplicitAny: resolved map varies per call site
  Resolved extends Record<string, any>,
  Multiline extends ReadonlyArray<keyof Infer<Schema>>,
  Radio extends ReadonlyArray<keyof Infer<Schema>>,
  Name extends keyof Infer<Schema>,
  M extends boolean | undefined,
  R extends boolean | undefined,
> = Omit<Partial<Field<Infer<Schema>>>, 'name' | 'multiline' | 'radio'> & {
  name: Name
  multiline?: M
  radio?: R
  type?: JSX.IntrinsicElements['input']['type']
  children?: Children<Schema, Resolved, Multiline, Radio, Name, M, R>
}

type FieldProps<
  Schema extends FormSchema,
  // biome-ignore lint/suspicious/noExplicitAny: resolved map varies per call site
  Resolved extends Record<string, any>,
  Multiline extends ReadonlyArray<keyof Infer<Schema>>,
  Radio extends ReadonlyArray<keyof Infer<Schema>>,
  Name extends keyof Infer<Schema>,
  M extends boolean | undefined,
  R extends boolean | undefined,
> = FieldBaseProps<Schema, Resolved, Multiline, Radio, Name, M, R> &
  Omit<JSX.IntrinsicElements['div'], 'children'>

type FieldComponent<
  Schema extends FormSchema,
  // biome-ignore lint/suspicious/noExplicitAny: resolved map varies per call site
  Resolved extends Record<string, any>,
  Multiline extends ReadonlyArray<keyof Infer<Schema>>,
  Radio extends ReadonlyArray<keyof Infer<Schema>>,
> = <
  Name extends keyof Infer<Schema>,
  const M extends boolean | undefined = undefined,
  const R extends boolean | undefined = undefined,
>(
  props: FieldProps<Schema, Resolved, Multiline, Radio, Name, M, R>
) => React.ReactElement | null

type SmartInputBaseProps = {
  fieldType?: FieldType
  type?: React.HTMLInputTypeAttribute
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  value?: any
  autoFocus?: boolean
  autoComplete?: JSX.IntrinsicElements['input']['autoComplete']
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

type SmartInputSlot<
  Schema extends FormSchema,
  Multiline extends ReadonlyArray<keyof Infer<Schema>>,
  Radio extends ReadonlyArray<keyof Infer<Schema>>,
  Name extends keyof Infer<Schema>,
  M extends boolean | undefined,
  R extends boolean | undefined,
> = Name extends unknown
  ? IsBoolean<Infer<Schema>[Name]> extends true
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
  // biome-ignore lint/suspicious/noExplicitAny: resolved map varies per call site
  Resolved extends Record<string, any>,
  Multiline extends ReadonlyArray<keyof Infer<Schema>>,
  Radio extends ReadonlyArray<keyof Infer<Schema>>,
  Name extends keyof Infer<Schema>,
  M extends boolean | undefined,
  R extends boolean | undefined,
> = SmartInputBaseProps &
  Partial<
    PropsOf<Resolved[SmartInputSlot<Schema, Multiline, Radio, Name, M, R>]>
  >

const FieldContext = React.createContext<
  Partial<Omit<Field<never>, 'name'>> | undefined
>(undefined)

/**
 * Access information about the field currently being rendered.
 *
 * This hook is meant to be used from inside custom components passed to
 * {@link SchemaForm} or {@link RenderField}. It exposes metadata such as the
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
        '  2. A custom renderField function\n' +
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

// biome-ignore lint/suspicious/noExplicitAny: resolved map varies per call site
function createSmartInput(idPrefix: string, components: Record<string, any>) {
  const {
    input: Input,
    multiline: Multiline,
    select: Select,
    checkbox: Checkbox,
    label: Label,
    radio: Radio,
    radioWrapper: RadioWrapper,
  } = components

  return ({
    fieldType,
    type,
    value,
    autoFocus,
    autoComplete,
    options,
    multiline,
    radio,
    placeholder,
    registerProps,
    a11yProps,
    ...props
  }: SmartInputBaseProps) => {
    if (!registerProps) return null

    const makeRadioOption =
      (props: Record<string, unknown>, checkedValue: Option['value']) =>
      ({ name, value }: Option) => {
        const propsWithUniqueId = mapObject(props, (key, propValue) =>
          key === 'id' ? [key, `${propValue}-${value}`] : [key, propValue]
        )
        return (
          <RadioWrapper key={String(propsWithUniqueId?.id)}>
            <Radio
              type="radio"
              value={value}
              defaultChecked={value === checkedValue}
              {...propsWithUniqueId}
            />
            <Label htmlFor={String(propsWithUniqueId?.id)}>{name}</Label>
          </RadioWrapper>
        )
      }

    const { name } = registerProps

    const commonProps = {
      id: `${idPrefix}${name}`,
      autoFocus,
      ...registerProps,
      ...props,
    }

    const withAutoComplete = { ...commonProps, autoComplete }

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

function createField<
  Schema extends FormSchema,
  // biome-ignore lint/suspicious/noExplicitAny: resolved map varies per call site
  Resolved extends Record<string, any>,
  Multiline extends ReadonlyArray<keyof Infer<Schema>>,
  Radio extends ReadonlyArray<keyof Infer<Schema>>,
>({
  register,
  idPrefix,
  components,
}: {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  register: UseFormRegister<any>
  idPrefix: string
  components: Resolved
}): FieldComponent<Schema, Resolved, Multiline, Radio> {
  // biome-ignore lint/suspicious/noExplicitAny: widen for internal JSX rendering — generics are for the external API
  const c = components as Record<string, React.ComponentType<any>>
  const Field = c.field
  const Label = c.label
  const Input = c.input
  const Multiline = c.multiline
  const Select = c.select
  const Radio = c.radio
  const Checkbox = c.checkbox
  const CheckboxWrapper = c.checkboxWrapper
  const RadioGroup = c.radioGroup
  const RadioWrapper = c.radioWrapper
  const Errors = c.fieldErrors
  const Error = c.error

  return React.forwardRef(
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
        children: childrenFn,
        ...props
      }: // biome-ignore lint/suspicious/noExplicitAny: internal implementation — generics are for the external API
      Record<string, any>,
      ref
    ) => {
      const value = fieldType === 'date' ? parseDate(rawValue) : rawValue
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

      const style = hidden ? { display: 'none' } : undefined
      const type = typeProp ?? getInputType(fieldType, radio)

      const { ref: registerRef, ...registerProps } = register(String(name), {
        setValueAs: (value) => {
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
      })

      const labelId = `${idPrefix}label-for-${name.toString()}`
      const errorsId = `${idPrefix}errors-for-${name.toString()}`

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
        const childrenDefinition =
          // biome-ignore lint/suspicious/noExplicitAny: type safety is enforced on the consumer side via FieldBaseProps
          (childrenFn as (...args: any[]) => React.ReactNode)({
            Label,
            SmartInput,
            Input,
            Multiline,
            Select,
            Checkbox,
            Radio,
            RadioGroup,
            RadioWrapper,
            CheckboxWrapper,
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
            // biome-ignore lint/suspicious/noExplicitAny: <explanation>
            const { ref: childRef } = child as any
            if (childRef) {
              childRef.current = instance
            }
          }

          if (child.type === Label) {
            return React.cloneElement(child, {
              id: labelId,
              htmlFor: `${idPrefix}${String(name)}`,
              children: label,
              ...child.props,
            })
          }
          if (child.type === SmartInput) {
            const smartInputProps: SmartInputBaseProps = {
              fieldType,
              type,
              options: options,
              multiline,
              radio,
              placeholder,
              registerProps: { ...registerProps, ref: mergedRef },
              autoFocus,
              autoComplete,
              value,
              a11yProps,
            }

            return React.cloneElement(child, {
              ...smartInputProps,
              ...child.props,
            })
          }
          if (child.type === Input) {
            return React.cloneElement(child, {
              id: `${idPrefix}${String(name)}`,
              type,
              ...registerProps,
              ...a11yProps,
              placeholder,
              autoFocus,
              autoComplete,
              defaultValue: value,
              ...child.props,
              ref: mergedRef,
            })
          }
          if (child.type === Multiline) {
            return React.cloneElement(child, {
              id: `${idPrefix}${String(name)}`,
              ...registerProps,
              ...a11yProps,
              placeholder,
              autoFocus,
              autoComplete,
              defaultValue: value,
              ...child.props,
              ref: mergedRef,
            })
          }
          if (child.type === Select) {
            return React.cloneElement(child, {
              id: `${idPrefix}${String(name)}`,
              ...registerProps,
              ...a11yProps,
              autoFocus,
              autoComplete,
              defaultValue: value,
              children: makeOptionComponents(makeSelectOption, options),
              ...child.props,
              ref: mergedRef,
            })
          }
          if (
            child.type === Checkbox &&
            ((child.type as unknown) !== 'input' ||
              child.props.type === 'checkbox')
          ) {
            return React.cloneElement(child, {
              id: `${idPrefix}${String(name)}`,
              type,
              autoFocus,
              ...registerProps,
              ...a11yProps,
              placeholder,
              defaultChecked: Boolean(value),
              ...child.props,
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
            return React.cloneElement(child, {
              id: `${idPrefix}${String(name)}-${child.props.value}`,
              type: 'radio',
              autoFocus,
              ...registerProps,
              defaultChecked: value === child.props.value,
              ...child.props,
              ref: mergedRef,
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

        const fixRadioLabels = (children: React.ReactNode) =>
          mapChildren(children, (child) => {
            if (child.type === Label) {
              const parent = findParent(children, child)
              if (parent && parent.type === RadioWrapper) {
                const radioChild = findElement(
                  parent.props?.children,
                  (ch) => ch.type === Radio
                )
                if (radioChild) {
                  return React.cloneElement(child, {
                    htmlFor: radioChild.props.id,
                  })
                }
              }
            }
            return child
          })

        return (
          <FieldContext.Provider value={field}>
            <Field hidden={hidden} style={style} {...props}>
              {fixRadioLabels(children)}
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
          registerProps={{ ref: registerRef, ...registerProps }}
          autoFocus={autoFocus}
          autoComplete={autoComplete}
          value={value}
          a11yProps={a11yProps}
        />
      )

      return (
        <FieldContext.Provider value={field}>
          <Field hidden={hidden} style={style} {...props}>
            {fieldType === 'boolean' ? (
              <CheckboxWrapper>
                {smartInput}
                <Label id={labelId} htmlFor={`${idPrefix}${String(name)}`}>
                  {label}
                </Label>
              </CheckboxWrapper>
            ) : radio ? (
              <>
                <Label id={labelId}>{label}</Label>
                <RadioGroup {...a11yProps}>{smartInput}</RadioGroup>
              </>
            ) : (
              <>
                <Label id={labelId} htmlFor={`${idPrefix}${String(name)}`}>
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
  ) as unknown as FieldComponent<Schema, Resolved, Multiline, Radio>
}

export type {
  FieldType,
  FieldComponent,
  Option,
  SmartInputSlot,
  IsBoolean,
  IsEnum,
}
export { createField }
