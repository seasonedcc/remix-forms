import * as React from 'react'
import type {UseFormRegisterReturn} from "react-hook-form";
import type {SomeZodObject} from "zod";
import type {FormProps} from "./Form";
import { createSmartInput } from './createSmartInput'
import type {FieldType} from "./createField";

type ArrayInputProps = {
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

function createArrayInput<Schema extends SomeZodObject>({
  inputComponent: Input = 'input',
  multilineComponent: Multiline = 'textarea',
  selectComponent: Select = 'select',
  checkboxComponent: Checkbox = 'input',
 }: Pick<
  FormProps<Schema>,
  | 'fieldComponent'
  | 'labelComponent'
  | 'inputComponent'
  >) {
  return ({
            type,
    value,
    autoFocus,
    selectChildren,
    placeholder,
    registerProps,
    a11yProps,
    ...props
  }: ArrayInputProps) => {
    const [values, setValues] = React.useState(value || []);

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

    const name = registerProps?.name;

    return (
      <>
        {'TYPE ' + type}
        {JSON.stringify(values)}
        {JSON.stringify(value)}
        {JSON.stringify(registerProps)}
        {JSON.stringify(a11yProps)}
        {JSON.stringify(props)}
        {values.map((value: string, index: number) => (
          <div key={(index) + '-container'} className={'flex'}>
            <div key={(index) + '-inputs'} className={'grow'}>
              <SmartInput
                fieldType={type}
                type={type}
                selectChildren={selectChildren}
                multiline={multiline}
                placeholder={placeholder}
                registerProps={registerProps}
                autoFocus={autoFocus}
                value={value}
                a11yProps={a11yProps}
              />
              <SmartInput
                name={name + '[' + (index) + ']'}
                type={type}
                key={(index) + '-input'}
                value={values[index]}
                onChange={(e) => {
                  const newValues = [...values]
                  newValues[index] = e.target.value
                  setValues(newValues)
                }
                }/>
            </div>
            <button
              className={'w-3'}
              key={(index) + '-delete'}
              onClick={(e) => {
                e.preventDefault();
                const newValues = values.slice(0, index)
                newValues.push(...values.slice(index + 1))
                setValues(newValues)
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="currentColor" className="bi bi-x"
                   viewBox="0 0 16 16">
                <path
                  d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
              </svg>
            </button>
          </div>
        ))}
        <button
          type={'button'}
          onClick={(e) => {
            e.preventDefault();
            setValues([...values, ''])
          }}
          className={'inline-flex items-center justify-center rounded-md border border-transparent px-6 py-2 text-base font-medium shadow-sm ring-2 ring-transparent ring-offset-2 ring-offset-transparent focus:outline-none disabled:bg-gray-400 bg-pink-600 text-white hover:bg-pink-700 focus:ring-pink-500 focus:ring-offset-white'}
        >
          Add
        </button>
      </>
      );
  }
}

export type { ArrayInputProps }
export { createArrayInput }
