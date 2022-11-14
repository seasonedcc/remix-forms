import * as React from 'react'
import type { SomeZodObject, z } from 'zod'
import type { UseFormRegister, UseFormRegisterReturn } from 'react-hook-form'
import type { Field } from './createForm'
import { mapChildren } from './childrenTraversal'
import { coerceValue } from './coercions'
import { ComponentOrTagName, parseDate } from './prelude'

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
  checkboxWrapperComponent?: ComponentOrTagName<'div'>
  fieldErrorsComponent?: ComponentOrTagName<'div'>
  errorComponent?: ComponentOrTagName<'div'>
}

type SmartInputProps = {
  fieldType?: FieldType
  type?: React.HTMLInputTypeAttribute
  value?: any
  autoFocus?: boolean
  selectChildren?: JSX.Element[]
  multiline?: boolean
  placeholder?: string
  registerProps?: UseFormRegisterReturn
  className?: string
  a11yProps?: Record<`aria-${string}`, string | boolean | undefined>
}

function createSmartInput({
  inputComponent: Input = 'input',
  multilineComponent: Multiline = 'textarea',
  selectComponent: Select = 'select',
  checkboxComponent: Checkbox = 'input',
}: ComponentMappings) {
  // eslint-disable-next-line react/display-name
  return ({
    fieldType,
    type,
    value,
    autoFocus,
    selectChildren,
    multiline,
    placeholder,
    registerProps,
    a11yProps,
    ...props
  }: SmartInputProps) => {
    if (!registerProps) return null

    const { name } = registerProps

    if (fieldType === 'boolean') {
      return (
        <Checkbox
          id={name}
          type={type}
          {...registerProps}
          placeholder={placeholder}
          autoFocus={autoFocus}
          defaultChecked={Boolean(value)}
          {...a11yProps}
          {...props}
        />
      )
    }

    if (selectChildren) {
      return (
        <Select
          id={name}
          {...registerProps}
          autoFocus={autoFocus}
          defaultValue={value}
          {...a11yProps}
          {...props}
        >
          {selectChildren}
        </Select>
      )
    }

    if (multiline) {
      return (
        <Multiline
          id={name}
          {...registerProps}
          placeholder={placeholder}
          autoFocus={autoFocus}
          defaultValue={value}
          {...a11yProps}
          {...props}
        />
      )
    }

    return (
      <Input
        id={name}
        type={type}
        {...registerProps}
        placeholder={placeholder}
        autoFocus={autoFocus}
        defaultValue={value}
        {...a11yProps}
        {...props}
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
  checkboxComponent: Checkbox = 'input',
  checkboxWrapperComponent: CheckboxWrapper = 'div',
  fieldErrorsComponent: Errors = 'div',
  errorComponent: Error = 'div',
}: {
  register: UseFormRegister<any>
} & ComponentMappings): FieldComponent<Schema> {
  // eslint-disable-next-line react/display-name
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
        placeholder,
        hidden = false,
        children: childrenFn,
        ...props
      },
      ref,
    ) => {
      const value = fieldType === 'date' ? parseDate(rawValue) : rawValue

      const selectChildren = options
        ? options.map(({ name, value }) => (
            <option key={String(value)} value={value}>
              {name}
            </option>
          ))
        : undefined

      const errorsChildren = errors?.length
        ? errors.map((error) => <Error key={error}>{error}</Error>)
        : undefined

      const style = hidden ? { display: 'none' } : undefined
      const type = typeProp || types[fieldType]

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
          }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [Input, Multiline, Select, Checkbox],
      )

      if (childrenFn) {
        const children = childrenFn({
          Label,
          SmartInput,
          Input,
          Multiline,
          Select,
          Checkbox,
          CheckboxWrapper,
          Errors,
          Error,
          ref,
          shape,
          fieldType,
          name,
          required,
          label,
          type,
          options,
          errors,
          autoFocus,
          value,
          hidden,
          multiline,
          placeholder,
        })

        return (
          <Field hidden={hidden} style={style} {...props}>
            {mapChildren(children, (child) => {
              if (!React.isValidElement(child)) return child

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
                  selectChildren,
                  multiline,
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
                  children: selectChildren,
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
            })}
          </Field>
        )
      }

      const smartInput = (
        <SmartInput
          fieldType={fieldType}
          type={type}
          selectChildren={selectChildren}
          multiline={multiline}
          placeholder={placeholder}
          registerProps={registerProps}
          autoFocus={autoFocus}
          value={value}
          a11yProps={a11yProps}
        />
      )

      return (
        <Field hidden={hidden} style={style} {...props}>
          {fieldType === 'boolean' ? (
            <CheckboxWrapper>
              {smartInput}
              <Label id={labelId} htmlFor={String(name)}>
                {label}
              </Label>
            </CheckboxWrapper>
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
      )
    },
  )
}

export type { FieldType, FieldComponent, ComponentMappings }
export { createField }
