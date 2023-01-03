import * as React from 'react'
import type { SomeZodObject, z } from 'zod'
import type { UseFormRegister, UseFormRegisterReturn } from 'react-hook-form'
import type { Field } from './createForm'
import { findElement, mapChildren, findParent } from './childrenTraversal'
import { coerceValue } from './coercions'
import type { ComponentOrTagName } from './prelude'
import { mapObject, parseDate } from './prelude'

type Option = { name: string } & Required<
  Pick<React.OptionHTMLAttributes<HTMLOptionElement>, 'value'>
>

type Children<Schema extends SomeZodObject> = (
  helpers: FieldBaseProps<Schema> & {
    Label: ComponentOrTagName<'label'>
    SmartInput: React.ComponentType<SmartInputProps>
    Input:
      | React.ForwardRefExoticComponent<
          React.PropsWithoutRef<JSX.IntrinsicElements['input']> &
            React.RefAttributes<HTMLInputElement>
        >
      | string
    Multiline:
      | React.ForwardRefExoticComponent<
          React.PropsWithoutRef<JSX.IntrinsicElements['textarea']> &
            React.RefAttributes<HTMLTextAreaElement>
        >
      | string
    Select:
      | React.ForwardRefExoticComponent<
          React.PropsWithoutRef<JSX.IntrinsicElements['select']> &
            React.RefAttributes<HTMLSelectElement>
        >
      | string
    Checkbox:
      | React.ForwardRefExoticComponent<
          React.PropsWithoutRef<JSX.IntrinsicElements['input']> &
            React.RefAttributes<HTMLInputElement>
        >
      | string
    RadioGroup: ComponentOrTagName<'fieldset'>
    RadioWrapper: ComponentOrTagName<'div'>
    Radio:
      | React.ForwardRefExoticComponent<
          React.PropsWithoutRef<JSX.IntrinsicElements['input']> &
            React.RefAttributes<HTMLInputElement>
        >
      | string
    CheckboxWrapper: ComponentOrTagName<'div'>
    Errors: ComponentOrTagName<'div'>
    Error: ComponentOrTagName<'div'>
    ref: React.ForwardedRef<any>
  },
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
  radio: boolean,
): React.HTMLInputTypeAttribute {
  if (radio) return 'radio'

  return types[type]
}

type FieldBaseProps<Schema extends SomeZodObject> = Omit<
  Partial<Field<z.infer<Schema>>>,
  'name'
> & {
  name: keyof z.infer<Schema>
  type?: JSX.IntrinsicElements['input']['type']
  children?: Children<Schema>
}

type FieldProps<Schema extends SomeZodObject> = FieldBaseProps<Schema> &
  Omit<JSX.IntrinsicElements['div'], 'children'>

type FieldComponent<Schema extends SomeZodObject> =
  React.ForwardRefExoticComponent<FieldProps<Schema> & React.RefAttributes<any>>

type ComponentMappings = {
  fieldComponent?: ComponentOrTagName<'div'>
  labelComponent?: ComponentOrTagName<'label'>
  inputComponent?:
    | React.ForwardRefExoticComponent<
        React.PropsWithoutRef<JSX.IntrinsicElements['input']> &
          React.RefAttributes<HTMLInputElement>
      >
    | string
  multilineComponent?:
    | React.ForwardRefExoticComponent<
        React.PropsWithoutRef<JSX.IntrinsicElements['textarea']> &
          React.RefAttributes<HTMLTextAreaElement>
      >
    | string
  selectComponent?:
    | React.ForwardRefExoticComponent<
        React.PropsWithoutRef<JSX.IntrinsicElements['select']> &
          React.RefAttributes<HTMLSelectElement>
      >
    | string
  checkboxComponent?:
    | React.ForwardRefExoticComponent<
        React.PropsWithoutRef<JSX.IntrinsicElements['input']> &
          React.RefAttributes<HTMLInputElement>
      >
    | string
  radioComponent?:
    | React.ForwardRefExoticComponent<
        React.PropsWithoutRef<JSX.IntrinsicElements['input']> &
          React.RefAttributes<HTMLInputElement>
      >
    | string
  checkboxWrapperComponent?: ComponentOrTagName<'div'>
  radioWrapperComponent?: ComponentOrTagName<'div'>
  radioGroupComponent?: ComponentOrTagName<'fieldset'>
  fieldErrorsComponent?: ComponentOrTagName<'div'>
  errorComponent?: ComponentOrTagName<'div'>
}

type SmartInputProps = {
  fieldType?: FieldType
  type?: React.HTMLInputTypeAttribute
  value?: any
  autoFocus?: boolean
  options?: Option[]
  multiline?: boolean
  radio?: boolean
  placeholder?: string
  registerProps?: UseFormRegisterReturn
  className?: string
  a11yProps?: Record<`aria-${string}`, string | boolean | undefined>
}

const FieldContext = React.createContext<
  Partial<Omit<Field<never>, 'name'>> | undefined
>(undefined)

export function useField() {
  const context = React.useContext(FieldContext)

  if (!context) throw new Error('useField used outside of field context')

  return context
}

const makeSelectOption = ({ name, value }: Option) => (
  <option key={String(value)} value={value}>
    {name}
  </option>
)

const makeOptionComponents = (
  fn: (option: Option) => JSX.Element,
  options: Option[] | undefined,
) => (options ? options.map(fn) : undefined)

function createSmartInput({
  inputComponent: Input = 'input',
  multilineComponent: Multiline = 'textarea',
  selectComponent: Select = 'select',
  checkboxComponent: Checkbox = 'input',
  labelComponent: Label = 'label',
  radioComponent: Radio = 'input',
  radioWrapperComponent: RadioWrapper = 'div',
}: ComponentMappings) {
  return ({
    fieldType,
    type,
    value,
    autoFocus,
    options,
    multiline,
    radio,
    placeholder,
    registerProps,
    a11yProps,
    ...props
  }: SmartInputProps) => {
    if (!registerProps) return null

    const makeRadioOption =
      (props: Record<string, unknown>, checkedValue: Option['value']) =>
      ({ name, value }: Option) => {
        const propsWithUniqueId = mapObject(props, (key, propValue) =>
          key === 'id' ? [key, `${propValue}-${value}`] : [key, propValue],
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
      id: name,
      autoFocus,
      ...registerProps,
      ...props,
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
      <Select defaultValue={value} {...commonProps} {...a11yProps}>
        {makeOptionComponents(makeSelectOption, options)}
      </Select>
    ) : options && radio ? (
      <>{makeOptionComponents(makeRadioOption(commonProps, value), options)}</>
    ) : multiline ? (
      <Multiline
        placeholder={placeholder}
        defaultValue={value}
        {...commonProps}
        {...a11yProps}
      />
    ) : (
      <Input
        type={type}
        placeholder={placeholder}
        defaultValue={value}
        {...commonProps}
        {...a11yProps}
      />
    )
  }
}

function createField<Schema extends SomeZodObject>({
  register,
  fieldComponent: Field = 'div',
  labelComponent: Label = 'label',
  inputComponent: Input = 'input',
  multilineComponent: Multiline = 'textarea',
  selectComponent: Select = 'select',
  radioComponent: Radio = 'input',
  checkboxComponent: Checkbox = 'input',
  checkboxWrapperComponent: CheckboxWrapper = 'div',
  radioGroupComponent: RadioGroup = 'fieldset',
  radioWrapperComponent: RadioWrapper = 'div',
  fieldErrorsComponent: Errors = 'div',
  errorComponent: Error = 'div',
}: {
  register: UseFormRegister<any>
} & ComponentMappings): FieldComponent<Schema> {
  return React.forwardRef<any, FieldProps<Schema>>(
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
        children: childrenFn,
        ...props
      },
      ref,
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
        radio,
        required,
        shape,
        value,
      }

      const errorsChildren = errors?.length
        ? errors.map((error) => <Error key={error}>{error}</Error>)
        : undefined

      const style = hidden ? { display: 'none' } : undefined
      const type = typeProp ?? getInputType(fieldType, radio)

      const registerProps = register(String(name), {
        setValueAs: (value) => coerceValue(value, shape),
      })

      const labelId = `label-for-${name.toString()}`
      const errorsId = `errors-for-${name.toString()}`

      const a11yProps = {
        'aria-labelledby': labelId,
        'aria-invalid': Boolean(errors),
        'aria-describedby': errors ? errorsId : undefined,
        'aria-required': required,
      }

      const SmartInput = React.useMemo(
        () =>
          createSmartInput({
            inputComponent: Input,
            multilineComponent: Multiline,
            selectComponent: Select,
            checkboxComponent: Checkbox,
            radioComponent: Radio,
            radioWrapperComponent: RadioWrapper,
            labelComponent: Label,
          }),
        [],
      )

      if (childrenFn) {
        const childrenDefinition = childrenFn({
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
          if (child.type === Label) {
            return React.cloneElement(child, {
              id: labelId,
              htmlFor: String(name),
              children: label,
              ...child.props,
            })
          } else if (child.type === SmartInput) {
            return React.cloneElement(child, {
              fieldType,
              type,
              options: options,
              multiline,
              radio,
              placeholder,
              registerProps,
              autoFocus,
              value,
              a11yProps,
              ...child.props,
            })
          } else if (child.type === Input) {
            return React.cloneElement(child, {
              id: String(name),
              type,
              ...registerProps,
              ...a11yProps,
              placeholder,
              autoFocus,
              defaultValue: value,
              ...child.props,
            })
          } else if (child.type === Multiline) {
            return React.cloneElement(child, {
              id: String(name),
              ...registerProps,
              ...a11yProps,
              placeholder,
              autoFocus,
              defaultValue: value,
              ...child.props,
            })
          } else if (child.type === Select) {
            return React.cloneElement(child, {
              id: String(name),
              ...registerProps,
              ...a11yProps,
              autoFocus,
              defaultValue: value,
              children: makeOptionComponents(makeSelectOption, options),
              ...child.props,
            })
          } else if (child.type === Checkbox) {
            return React.cloneElement(child, {
              id: String(name),
              type,
              autoFocus,
              ...registerProps,
              ...a11yProps,
              placeholder,
              defaultChecked: Boolean(value),
              ...child.props,
            })
          } else if (child.type === RadioGroup) {
            return React.cloneElement(child, {
              ...a11yProps,
              ...child.props,
            })
          } else if (child.type === Radio) {
            return React.cloneElement(child, {
              id: `${String(name)}-${child.props.value}`,
              type: 'radio',
              autoFocus,
              ...registerProps,
              defaultChecked: value === child.props.value,
              ...child.props,
            })
          } else if (child.type === Errors) {
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
          } else {
            return child
          }
        })

        const fixRadioLabels = (children: React.ReactNode) =>
          mapChildren(children, (child) => {
            if (child.type === Label) {
              const parent = findParent(children, child)
              if (parent && parent.type === RadioWrapper) {
                const radioChild = findElement(
                  parent.props?.children,
                  (ch) => ch.type === Radio,
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
          registerProps={registerProps}
          autoFocus={autoFocus}
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
                <Label id={labelId} htmlFor={String(name)}>
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
                <Label id={labelId} htmlFor={String(name)}>
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
    },
  )
}

export type { FieldType, FieldComponent, ComponentMappings, Option }
export { createField }
