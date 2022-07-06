import React, { useMemo } from 'react'
import { SomeZodObject, z } from 'zod'
import { UseFormRegister } from 'react-hook-form'
import { FormProps } from '.'
import { Field } from './Form'
import mapChildren from './mapChildren'
import { coerceValue } from './coercions'
import createSmartInput, { SmartInputProps } from './createSmartInput'

type Children<Schema extends SomeZodObject> = (
  helpers: FieldBaseProps<Schema> & {
    Label: React.ComponentType<JSX.IntrinsicElements['label']> | string
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
    CheckboxWrapper: React.ComponentType<JSX.IntrinsicElements['div']> | string
    Errors: React.ComponentType<JSX.IntrinsicElements['div']> | string
    Error: React.ComponentType<JSX.IntrinsicElements['div']> | string
    ref: React.ForwardedRef<any>
  },
) => React.ReactNode

export type FieldType = 'string' | 'boolean' | 'number' | 'date'

type FieldBaseProps<Schema extends SomeZodObject> = Omit<
  Partial<Field<z.infer<Schema>>>,
  'name'
> & {
  name: keyof z.infer<Schema>
  type?: JSX.IntrinsicElements['input']['type']
  children?: Children<Schema>
}

export type FieldProps<Schema extends SomeZodObject> = FieldBaseProps<Schema> &
  Omit<JSX.IntrinsicElements['div'], 'children'>

const types: Record<FieldType, React.HTMLInputTypeAttribute> = {
  boolean: 'checkbox',
  string: 'text',
  number: 'text',
  date: 'date',
}

function parseDate(value?: Date | string) {
  if (!value) return value

  const dateTime = typeof value === 'string' ? value : value.toISOString()
  const [date] = dateTime.split('T')
  return date
}

export default function createField<Schema extends SomeZodObject>({
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
}: { register: UseFormRegister<any> } & Pick<
  FormProps<Schema>,
  | 'fieldComponent'
  | 'labelComponent'
  | 'inputComponent'
  | 'multilineComponent'
  | 'selectComponent'
  | 'checkboxComponent'
  | 'checkboxWrapperComponent'
  | 'fieldErrorsComponent'
  | 'errorComponent'
>) {
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

      const SmartInput = useMemo(
        () =>
          createSmartInput({
            inputComponent: Input,
            multilineComponent: Multiline,
            selectComponent: Select,
            checkboxComponent: Checkbox,
          }),
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

      return (
        <Field hidden={hidden} style={style} {...props}>
          {fieldType === 'boolean' ? (
            <CheckboxWrapper>
              <Checkbox
                id={String(name)}
                type={type}
                {...registerProps}
                {...a11yProps}
                placeholder={placeholder}
                autoFocus={autoFocus}
                defaultChecked={Boolean(value)}
              />
              <Label id={labelId} htmlFor={String(name)}>
                {label}
              </Label>
            </CheckboxWrapper>
          ) : (
            <>
              <Label id={labelId} htmlFor={String(name)}>
                {label}
              </Label>
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
