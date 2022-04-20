import React, { useEffect, useMemo, useState } from 'react'
import {
  Form as RemixForm,
  FormProps as RemixFormProps,
  FormMethod,
  useTransition,
  useSubmit,
  useActionData,
} from '@remix-run/react'
import { SomeZodObject, z, ZodTypeAny } from 'zod'
import { useForm, UseFormReturn, FieldError, Path } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormErrors, FormValues } from './formAction.server'
import createField, { FieldProps, FieldType } from './createField'
import mapChildren from './mapChildren'
import defaultRenderField from './defaultRenderField'
import { Fetcher } from '@remix-run/react/transition'
import inferLabel from './inferLabel'
import { shapeInfo, ZodTypeName } from './shapeInfo'

type Field<SchemaType> = {
  shape: ZodTypeAny
  fieldType: FieldType
  name: keyof SchemaType
  label?: string
  options?: Option[]
  errors?: string[]
  autoFocus?: boolean
  value?: any
  hidden?: boolean
  multiline?: boolean
}

type FieldComponent<Schema extends SomeZodObject> =
  React.ForwardRefExoticComponent<FieldProps<Schema> & React.RefAttributes<any>>

export type RenderFieldProps<Schema extends SomeZodObject> = Field<
  z.infer<Schema>
> & {
  Field: FieldComponent<Schema>
}

export type RenderField<Schema extends SomeZodObject> = (
  props: RenderFieldProps<Schema>,
) => JSX.Element

export type Option = { name: string } & Required<
  Pick<React.OptionHTMLAttributes<HTMLOptionElement>, 'value'>
>

type Options<SchemaType> = Partial<Record<keyof SchemaType, Option[]>>

type AllRemixFormProps = RemixFormProps & React.RefAttributes<HTMLFormElement>

type Children<Schema extends SomeZodObject> = (
  helpers: {
    Field: FieldComponent<Schema>
    Errors: React.ComponentType<JSX.IntrinsicElements['div']> | string
    Error: React.ComponentType<JSX.IntrinsicElements['div']> | string
    Button: React.ComponentType<JSX.IntrinsicElements['button']> | string
  } & UseFormReturn<z.infer<Schema>, any>,
) => React.ReactNode

export type FormProps<Schema extends SomeZodObject> = {
  component?: React.ForwardRefExoticComponent<AllRemixFormProps>
  fetcher?: Fetcher<any> & {
    Form: ReturnType<any>
    submit: ReturnType<any>
    load: (href: string) => void
  }
  fieldComponent?: React.ComponentType<JSX.IntrinsicElements['div']> | string
  renderField?: RenderField<Schema>
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
  checkboxWrapperComponent?:
    | React.ComponentType<JSX.IntrinsicElements['div']>
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
  multiline?: Array<keyof z.infer<Schema>>
  beforeChildren?: React.ReactNode
  children?: Children<Schema>
} & Omit<AllRemixFormProps, 'method' | 'children'>

const fieldTypes: Record<ZodTypeName, FieldType> = {
  ZodString: 'string',
  ZodNumber: 'number',
  ZodBoolean: 'boolean',
  ZodEnum: 'string',
}

export function Form<Schema extends SomeZodObject>({
  component = RemixForm,
  fetcher,
  renderField = defaultRenderField,
  fieldComponent,
  globalErrorsComponent: Errors = 'div',
  errorComponent: Error = 'div',
  fieldErrorsComponent,
  labelComponent,
  inputComponent,
  multilineComponent,
  selectComponent,
  checkboxComponent,
  checkboxWrapperComponent,
  buttonComponent: Button = 'button',
  buttonLabel = 'OK',
  method = 'post',
  schema,
  beforeChildren,
  children: childrenFn,
  labels,
  options,
  hiddenFields,
  multiline,
  errors: errorsProp,
  values: valuesProp,
  ...props
}: FormProps<Schema>) {
  type SchemaType = z.infer<Schema>
  const Component = fetcher ? fetcher.Form : component
  const submit = fetcher ? fetcher.submit : useSubmit()
  const transition = fetcher ? fetcher : useTransition()
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

  const [disabled, setDisabled] = useState(false)

  useEffect(() => {
    setDisabled(transition.state === 'submitting' || !form.formState.isValid)
  }, [transition.state, form.formState.isValid])

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
        multilineComponent,
        selectComponent,
        checkboxComponent,
        checkboxWrapperComponent,
        fieldErrorsComponent,
        errorComponent: Error,
      }),
    [
      fieldComponent,
      labelComponent,
      inputComponent,
      multilineComponent,
      selectComponent,
      checkboxComponent,
      checkboxWrapperComponent,
      fieldErrorsComponent,
      Error,
    ],
  )

  useEffect(() => {
    for (const stringKey in schema.shape) {
      const key = stringKey as keyof SchemaType
      if (errors && errors[key]?.length) {
        try {
          form.setFocus(key as Path<SchemaType>)
        } catch {}
      }
    }
  }, [errors])

  let autoFocused = false
  let fields: Field<SchemaType>[] = []
  for (const stringKey in schema.shape) {
    const key = stringKey as keyof SchemaType
    const message = (formErrors[key] as unknown as FieldError)?.message
    const shape = schema.shape[stringKey]
    const fieldErrors = (message && [message]) || (errors && errors[key])
    const autoFocus = Boolean(fieldErrors && fieldErrors.length && !autoFocused)
    if (autoFocus) autoFocused = true

    const { typeName, optional, nullable } = shapeInfo(shape)
    const fieldType = typeName ? fieldTypes[typeName] : 'string'

    const fieldOptions = options && options[key]
    const enumOptions =
      typeName === 'ZodEnum'
        ? shape._def.values.map((value: string) => ({
            name: inferLabel(value),
            value,
          }))
        : undefined

    fields.push({
      shape,
      fieldType,
      name: stringKey,
      label: labels && labels[key],
      options: fieldOptions || enumOptions,
      errors: fieldErrors,
      autoFocus,
      value: values && values[key],
      hidden:
        hiddenFields && Boolean(hiddenFields.find((item) => item === key)),
      multiline: multiline && Boolean(multiline.find((item) => item === key)),
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
              shape: field?.shape,
              fieldType: field?.fieldType,
              label: field?.label,
              options: field?.options,
              value: field?.value,
              errors: field?.errors,
              autoFocus: field?.autoFocus,
              hidden: field?.hidden,
              multiline: field?.multiline,
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
      {fields.map((field) => renderField({ Field, ...field }))}
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
