import * as React from 'react'
import type { UseFormRegisterReturn } from 'react-hook-form'
import type { SomeZodObject } from 'zod'
import type { FieldType } from './createField'
import type { FormProps } from './Form'

type SmartInputProps = {
  array?: boolean
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
    array,
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
    const [arrayValues, setArrayValues] = React.useState(value || [])

    // TODO Current bugs/missing features
    // - With JS:
    //    - Each child in a list should have a unique "key" prop
    // - Without JS:
    //    - After an error is triggered the noJS Values are forgotten and the JS part is triggered -> renders the form unusable
    //    - no support for zod min() min because can't submit when length is less than min but can't increase without submit

    if (array) {
      return (
        <>
          {JSON.stringify(arrayValues)}
          {arrayValues.map((arrayValue:string|number, index:number) => (
            <div className={'flex'}>
              <div className={'grow'}>
                {selectChildren ? (
                  <Select
                    key={name + index}
                    autoFocus={autoFocus}
                    {...a11yProps}
                    {...props}
                    onChange={(e) => {
                      e.preventDefault()
                      const newValues = [...arrayValues]
                      newValues[index] = e.target.value
                      setArrayValues(newValues)
                    }}
                  >
                    {selectChildren}
                  </Select>
                ) : (
                  <Input
                    key={name + index}
                    placeholder={placeholder}
                    autoFocus={autoFocus}
                    value={arrayValue}
                    {...a11yProps}
                    {...props}
                    onChange={(e) => {
                      e.preventDefault()
                      const newValues = [...arrayValues]
                      newValues[index] = e.target.value
                      setArrayValues(newValues)
                    }}
                  />
                )}
              </div>
              <button
                className={'w-3'}
                key={(index) + '-delete'}
                onClick={(e) => {
                  e.preventDefault();
                  const newValues = arrayValues.slice(0, index)
                  newValues.push(...arrayValues.slice(index + 1))
                  setArrayValues(newValues)
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
          <noscript>
            {selectChildren ? (
              <Select
                key={name + '-add'}
                autoFocus={autoFocus}
                {...a11yProps}
                {...props}
                name={name + '[' + value.length + ']'}
              >
                {selectChildren}
              </Select>
            ) : (
              <Input
                key={name + '-add'}
                placeholder={placeholder}
                autoFocus={autoFocus}
                {...a11yProps}
                {...props}
                name={name + '[' + value.length + ']'}
              />
            )}
          </noscript>
          <button
            className={'inline-flex items-center justify-center rounded-md border border-transparent px-6 py-2 text-base font-medium shadow-sm ring-2 ring-transparent ring-offset-2 ring-offset-transparent focus:outline-none disabled:bg-gray-400 bg-pink-600 text-white hover:bg-pink-700 focus:ring-pink-500 focus:ring-offset-white'}
            onClick={(e) => {
              e.preventDefault()
              setArrayValues([...arrayValues, ''])
            }}
          >
            Add
          </button>
          <input
            id={name}
            type={type}
            {...registerProps}
            placeholder={placeholder}
            autoFocus={autoFocus}
            value={arrayValues}
            readOnly={true}
            {...a11yProps}
            {...props}
            hidden={true}
          />
        </>
      )
    }

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

export type { SmartInputProps }
export { createSmartInput }
