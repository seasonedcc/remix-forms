import React from 'react'
import { SomeZodObject, z } from 'zod'
import { UseFormRegister } from 'react-hook-form'
import { FormProps } from '.'
import { Option } from './Form'
import mapChildren from './mapChildren'
import inferLabel from './inferLabel'

type Children = (helpers: {
  Label: React.ComponentType<JSX.IntrinsicElements['label']> | string
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

export type FieldType = 'string' | 'boolean' | 'number'

export type FieldProps<Schema extends SomeZodObject> = {
  name: keyof z.infer<Schema>
  fieldType?: FieldType
  label?: string
  options?: Option[]
  errors?: string[]
  autoFocus?: boolean
  value?: any
  multiline?: boolean
  hidden?: boolean
  children?: Children
} & JSX.IntrinsicElements['div']

const types: Record<FieldType, JSX.IntrinsicElements['input']['type']> = {
  boolean: 'checkbox',
  string: 'text',
  number: 'number',
}

const registerOptions: Record<FieldType, any> = {
  boolean: {},
  string: {},
  number: { valueAsNumber: true },
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
        name,
        label: labelProp,
        options,
        errors,
        autoFocus = false,
        value,
        multiline = false,
        hidden = false,
        children: childrenFn,
        ...props
      }: FieldProps<Schema>,
      ref,
    ) => {
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
      const type = types[fieldType]
      const registerProps = register(String(name), registerOptions[fieldType])
      const label = labelProp || inferLabel(String(name))

      if (childrenFn) {
        const children = childrenFn({
          Label,
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
              {Boolean(label) && <Label htmlFor={String(name)}>{label}</Label>}
            </CheckboxWrapper>
          ) : (
            <>
              {Boolean(label) && <Label htmlFor={String(name)}>{label}</Label>}
              {selectChildren ? (
                <Select
                  id={String(name)}
                  {...registerProps}
                  autoFocus={autoFocus}
                  defaultValue={value}
                >
                  {selectChildren}
                </Select>
              ) : multiline ? (
                <Multiline
                  id={String(name)}
                  {...registerProps}
                  autoFocus={autoFocus}
                  defaultValue={value}
                />
              ) : (
                <Input
                  id={String(name)}
                  type={type}
                  {...registerProps}
                  autoFocus={autoFocus}
                  defaultValue={value}
                />
              )}
            </>
          )}
          {Boolean(errorsChildren) && <Errors>{errorsChildren}</Errors>}
        </Field>
      )
    },
  )
}
