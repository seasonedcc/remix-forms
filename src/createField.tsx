import React from 'react'
import { SomeZodObject, z } from 'zod'
import { UseFormRegister } from 'react-hook-form'
import { FormProps } from '.'
import { Option } from './Form'
import mapChildren from './mapChildren'

type Children = (helpers: {
  Label: React.ComponentType<JSX.IntrinsicElements['label']> | string
  Input:
    | React.ForwardRefExoticComponent<
        React.PropsWithoutRef<JSX.IntrinsicElements['input']> &
          React.RefAttributes<HTMLInputElement>
      >
    | string
  Select:
    | React.ForwardRefExoticComponent<
        React.PropsWithoutRef<JSX.IntrinsicElements['select']> &
          React.RefAttributes<HTMLSelectElement>
      >
    | string
  Errors: React.ComponentType<JSX.IntrinsicElements['div']> | string
  Error: React.ComponentType<JSX.IntrinsicElements['div']> | string
  ref: React.ForwardedRef<any>
}) => React.ReactNode

export type FieldProps<Schema extends SomeZodObject> = {
  name: keyof z.infer<Schema>
  label?: string
  options?: Option[]
  errors?: string[]
  value?: any
  children?: Children
} & JSX.IntrinsicElements['div']

export default function createField<Schema extends SomeZodObject>({
  register,
  fieldComponent: Field = 'div',
  labelComponent: Label = 'label',
  inputComponent: Input = 'input',
  selectComponent: Select = 'select',
  fieldErrorsComponent: Errors = 'div',
  errorComponent: Error = 'div',
}: { register: UseFormRegister<any> } & Pick<
  FormProps<Schema>,
  | 'fieldComponent'
  | 'labelComponent'
  | 'inputComponent'
  | 'selectComponent'
  | 'fieldErrorsComponent'
  | 'errorComponent'
>) {
  return React.forwardRef<any, FieldProps<Schema>>(
    (
      {
        name,
        label,
        options,
        errors,
        value,
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

      if (childrenFn) {
        const children = childrenFn({
          Label,
          Input,
          Select,
          Errors,
          Error,
          ref,
        })

        return (
          <Field {...props}>
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
                  ...register(String(name)),
                  defaultValue: value,
                  ...child.props,
                })
              } else if (child.type === Select) {
                return React.cloneElement(child, {
                  id: String(name),
                  ...register(String(name)),
                  defaultValue: value,
                  children: selectChildren,
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
        <Field {...props}>
          <Label htmlFor={String(name)}>{label}</Label>
          {selectChildren ? (
            <Select
              id={String(name)}
              {...register(String(name))}
              defaultValue={value}
            >
              {selectChildren}
            </Select>
          ) : (
            <Input
              id={String(name)}
              {...register(String(name))}
              defaultValue={value}
            />
          )}
          {errorsChildren && <Errors>{errorsChildren}</Errors>}
        </Field>
      )
    },
  )
}
