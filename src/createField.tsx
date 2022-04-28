import React, { useMemo } from 'react'
import { SomeZodObject, z, ZodTypeAny } from 'zod'
import { UseFormRegister } from 'react-hook-form'
import { FormProps } from '.'
import { Option } from './Form'
import mapChildren from './mapChildren'
import inferLabel from './inferLabel'
import { coerceValue } from './coercions'
import createSmartInput, { SmartInputProps } from './createSmartInput'

type Children = (helpers: {
  Label: React.ComponentType<JSX.IntrinsicElements['label']> | string
  SmartInput: React.ForwardRefExoticComponent<
    React.PropsWithoutRef<SmartInputProps> & React.RefAttributes<any>
  >
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
}) => React.ReactNode

export type FieldType = 'string' | 'boolean' | 'number' | 'date'

export type FieldProps<Schema extends SomeZodObject> = {
  name: keyof z.infer<Schema>
  shape?: ZodTypeAny
  fieldType?: FieldType
  label?: string
  options?: Option[]
  errors?: string[]
  type?: JSX.IntrinsicElements['input']['type']
  autoFocus?: boolean
  value?: any
  multiline?: boolean
  hidden?: boolean
  children?: Children
} & JSX.IntrinsicElements['div']

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
  return React.forwardRef<any, FieldProps<Schema>>(
    (
      {
        fieldType = 'string',
        shape,
        name,
        label: labelProp,
        options,
        errors,
        type: typeProp,
        autoFocus = false,
        value: rawValue,
        multiline = false,
        hidden = false,
        children: childrenFn,
        ...props
      }: FieldProps<Schema>,
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

      const label = labelProp || inferLabel(String(name))

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
        })

        return (
          <Field hidden={hidden} style={style} {...props}>
            {mapChildren(children, (child) => {
              if (!React.isValidElement(child)) return child

              if (child.type === Label) {
                return React.cloneElement(child, {
                  htmlFor: String(name),
                  children: label,
                  ...child.props,
                })
              } else if (child.type === Input) {
                return React.cloneElement(child, {
                  id: String(name),
                  type,
                  ...registerProps,
                  autoFocus,
                  defaultValue: value,
                  ...child.props,
                })
              } else if (child.type === Multiline) {
                return React.cloneElement(child, {
                  id: String(name),
                  ...registerProps,
                  autoFocus,
                  defaultValue: value,
                  ...child.props,
                })
              } else if (child.type === Select) {
                return React.cloneElement(child, {
                  id: String(name),
                  ...registerProps,
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
                  defaultChecked: Boolean(value),
                  ...child.props,
                })
              } else if (child.type === Errors) {
                if (!child.props.children && !errors?.length) return null
                if (child.props.children || !errors?.length) return child

                return React.cloneElement(child, {
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
                autoFocus={autoFocus}
                defaultChecked={Boolean(value)}
              />
              <Label htmlFor={String(name)}>{label}</Label>
            </CheckboxWrapper>
          ) : (
            <>
              <Label htmlFor={String(name)}>{label}</Label>
              <SmartInput
                fieldType={fieldType}
                type={type}
                selectChildren={selectChildren}
                multiline={multiline}
                registerProps={registerProps}
                autoFocus={autoFocus}
                value={value}
              />
            </>
          )}
          {Boolean(errorsChildren) && <Errors>{errorsChildren}</Errors>}
        </Field>
      )
    },
  )
}
