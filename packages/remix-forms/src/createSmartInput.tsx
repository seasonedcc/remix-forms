import * as React from 'react'
import type { UseFormRegisterReturn } from 'react-hook-form'
import type { SomeZodObject } from 'zod'
import type { FieldType } from './createField'
import type { FormProps } from './Form'

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

function createSmartInput<Schema extends SomeZodObject>({
  inputComponent: Input = 'input',
  multilineComponent: Multiline = 'textarea',
  selectComponent: Select = 'select',
  checkboxComponent: Checkbox = 'input',
}: Pick<
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

    if (fieldType === 'array') {
      return (
        /*<ul>
          {value && value.map((value:string, index:number) => (
            <li key={index}>{value}</li>
          ))}
          <li>
            <Select
              id={name}
              {...registerProps}
              autoFocus={autoFocus}
              defaultValue={value}
              {...a11yProps}
              {...props}
            />
            {/!*<Input
              id={name}
              type={type}
              {...registerProps}
              placeholder={placeholder}
              autoFocus={autoFocus}
              {...a11yProps}
              {...props}
              onChange={(e) => {
                value.push(e.target.value)
              }}
            />*!/}
          </li>
        </ul>*/
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

export type { SmartInputProps }
export { createSmartInput }
