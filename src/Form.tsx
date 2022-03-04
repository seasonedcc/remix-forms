import React, { useEffect, useMemo } from 'react'
import {
  Form as RemixForm,
  FormProps as RemixFormProps,
  FormMethod,
  useTransition,
  useSubmit,
  useActionData,
} from '@remix-run/react'
import { SomeZodObject, z } from 'zod'
import { useForm, UseFormReturn, FieldError, Path } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormErrors, FormValues } from './formAction.server'
import createField, { FieldProps } from './createField'
import mapChildren from './mapChildren'

type Field<SchemaType> = {
  name: keyof SchemaType
  label?: string
  options?: Option[]
  errors?: string[]
  value?: any
  hidden?: boolean
}

export type Option = { name: string } & Required<
  Pick<React.OptionHTMLAttributes<HTMLOptionElement>, 'value'>
>

type Options<SchemaType> = Partial<Record<keyof SchemaType, Option[]>>

type AllRemixFormProps = RemixFormProps & React.RefAttributes<HTMLFormElement>

type Children<Schema extends SomeZodObject> = (
  helpers: {
    Field: React.ForwardRefExoticComponent<
      FieldProps<Schema> & React.RefAttributes<any>
    >
    Errors: React.ComponentType<JSX.IntrinsicElements['div']> | string
    Error: React.ComponentType<JSX.IntrinsicElements['div']> | string
    Button: React.ComponentType<JSX.IntrinsicElements['button']> | string
  } & UseFormReturn<z.infer<Schema>, any>,
) => React.ReactNode

export type FormProps<Schema extends SomeZodObject> = {
  component?: React.ForwardRefExoticComponent<AllRemixFormProps>
  fieldComponent?: React.ComponentType<JSX.IntrinsicElements['div']> | string
  globalErrorsComponent?:
    | React.ComponentType<JSX.IntrinsicElements['div']>
    | string
  fieldErrorsComponent?:
    | React.ComponentType<JSX.IntrinsicElements['div']>
    | string
  errorComponent?: React.ComponentType<JSX.IntrinsicElements['div']> | string
  labelComponent?: React.ComponentType<JSX.IntrinsicElements['label']> | string
  inputComponent?:
    | React.ForwardRefExoticComponent<
        React.PropsWithoutRef<JSX.IntrinsicElements['input']> &
          React.RefAttributes<HTMLInputElement>
      >
    | string
  selectComponent?:
    | React.ForwardRefExoticComponent<
        React.PropsWithoutRef<JSX.IntrinsicElements['select']> &
          React.RefAttributes<HTMLSelectElement>
      >
    | string
  buttonComponent?:
    | React.ComponentType<JSX.IntrinsicElements['button']>
    | string
  buttonLabel?: string
  method?: FormMethod
  schema: Schema
  errors?: FormErrors<z.infer<Schema>>
  values?: FormValues<z.infer<Schema>>
  labels?: Partial<Record<keyof z.infer<Schema>, string>>
  options?: Options<z.infer<Schema>>
  hiddenFields?: Array<keyof z.infer<Schema>>
  beforeChildren?: React.ReactNode
  children?: Children<Schema>
} & Omit<AllRemixFormProps, 'method' | 'children'>

export function Form<Schema extends SomeZodObject>({
  component: Component = RemixForm,
  fieldComponent,
  globalErrorsComponent: Errors = 'div',
  errorComponent: Error = 'div',
  fieldErrorsComponent,
  labelComponent,
  inputComponent,
  selectComponent,
  buttonComponent: Button = 'button',
  buttonLabel = 'OK',
  method = 'post',
  schema,
  beforeChildren,
  children: childrenFn,
  labels,
  options,
  hiddenFields,
  errors: errorsProp,
  values: valuesProp,
  ...props
}: FormProps<Schema>) {
  type SchemaType = z.infer<Schema>
  const submit = useSubmit()
  const transition = useTransition()
  const actionData = useActionData()

  const errors = {
    ...errorsProp,
    ...(actionData?.errors as FormErrors<SchemaType>),
  }

  const values = {
    ...valuesProp,
    ...(actionData?.values as FormValues<SchemaType>),
  }

  const form = useForm<SchemaType>({
    resolver: zodResolver(schema),
    mode: 'onChange',
  })
  form.watch()

  const { errors: formErrors } = form.formState
  const disabled = transition.state === 'submitting' || !form.formState.isValid

  const onSubmit = (event: any) => {
    form.handleSubmit(() => submit(event.target, { replace: true }))(event)
  }

  const Field = useMemo(
    () =>
      createField({
        register: form.register,
        fieldComponent,
        labelComponent,
        inputComponent,
        selectComponent,
        fieldErrorsComponent,
        errorComponent: Error,
      }),
    [
      fieldComponent,
      labelComponent,
      inputComponent,
      selectComponent,
      fieldErrorsComponent,
      Error,
    ],
  )

  useEffect(() => {
    for (const stringKey in schema.shape) {
      const key = stringKey as keyof SchemaType
      if (errors && errors[key]?.length) {
        form.setFocus(key as Path<SchemaType>)
      }
    }
  }, [errors])

  let fields: Field<SchemaType>[] = []
  for (const stringKey in schema.shape) {
    const key = stringKey as keyof SchemaType
    const message = (formErrors[key] as unknown as FieldError)?.message

    fields.push({
      name: stringKey,
      label: labels && labels[key],
      options: options && options[key],
      errors: (message && [message]) || (errors && errors[key]),
      value: values && values[key],
      hidden:
        hiddenFields && Boolean(hiddenFields.find((item) => item === key)),
    })
  }

  const globalErrors = errors?._global

  if (childrenFn) {
    const children = childrenFn({ Field, Errors, Error, Button, ...form })

    return (
      <Component method={method} onSubmit={onSubmit} {...props}>
        {beforeChildren}
        {mapChildren(children, (child) => {
          if (!React.isValidElement(child)) return child

          if (child.type === Field) {
            const { name } = child.props
            const field = fields.find((field) => field.name === name)

            return React.cloneElement(child, {
              label: field?.label,
              options: field?.options,
              value: field?.value,
              errors: field?.errors,
              hidden: field?.hidden,
              ...child.props,
            })
          } else if (child.type === Errors) {
            if (!child.props.children && !globalErrors?.length) return null
            if (child.props.children || !globalErrors?.length) return child

            return React.cloneElement(child, {
              children: globalErrors.map((error) => (
                <Error key={error}>{error}</Error>
              )),
              ...child.props,
            })
          } else if (child.type === Button) {
            return React.cloneElement(child, {
              disabled: disabled,
              children: buttonLabel,
              ...child.props,
            })
          } else {
            return child
          }
        })}
      </Component>
    )
  }

  return (
    <Component method={method} onSubmit={onSubmit} {...props}>
      {beforeChildren}
      {fields.map(({ name, label, options, errors, value, hidden }) => (
        <Field
          key={String(name)}
          name={name}
          label={label}
          options={options}
          errors={errors}
          value={value}
          hidden={hidden}
        />
      ))}
      {globalErrors?.length && (
        <Errors>
          {globalErrors.map((error) => (
            <Error key={error}>{error}</Error>
          ))}
        </Errors>
      )}
      <Button disabled={disabled}>{buttonLabel}</Button>
    </Component>
  )
}
