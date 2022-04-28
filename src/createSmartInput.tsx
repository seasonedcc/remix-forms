import React from 'react'
import { UseFormRegisterReturn } from 'react-hook-form'
import { SomeZodObject, z } from 'zod'
import { FieldType } from './createField'
import { FormProps } from './Form'

export type SmartInputProps = {
  fieldType: FieldType
  type: React.HTMLInputTypeAttribute
  value: any
  autoFocus: boolean
  selectChildren: JSX.Element[] | undefined
  multiline: boolean
  registerProps: UseFormRegisterReturn
}

export default function createSmartInput<Schema extends SomeZodObject>({
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
  return React.forwardRef<any, SmartInputProps>(
    (
      {
        fieldType,
        type,
        value,
        autoFocus,
        selectChildren,
        multiline,
        registerProps,
      },
      ref,
    ) => {
      const { name } = registerProps

      if (fieldType === 'boolean') {
        return (
          <Checkbox
            id={name}
            type={type}
            {...registerProps}
            autoFocus={autoFocus}
            defaultChecked={Boolean(value)}
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
            autoFocus={autoFocus}
            defaultValue={value}
          />
        )
      }

      return (
        <Input
          id={name}
          type={type}
          {...registerProps}
          autoFocus={autoFocus}
          defaultValue={value}
        />
      )
    },
  )
}
