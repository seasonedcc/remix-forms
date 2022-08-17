import * as React from 'react'
import type { FormProps as RemixFormProps, FormMethod } from '@remix-run/react'
import {
  Form as RemixForm,
  useTransition,
  useSubmit,
  useActionData,
} from '@remix-run/react'
import type { SomeZodObject, z, ZodTypeAny } from 'zod'
import type {
  UseFormReturn,
  FieldError,
  Path,
  ValidationMode,
} from 'react-hook-form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { FormErrors, FormValues } from './formAction.server'
import type { FieldProps, FieldType } from './createField'
import { createField } from './createField'
import { mapChildren } from './mapChildren'
import { defaultRenderField } from './defaultRenderField'
import type { Fetcher } from '@remix-run/react'
import { inferLabel } from './inferLabel'
import type { ZodTypeName } from './shapeInfo'
import { shapeInfo } from './shapeInfo'
import type { Transition } from '@remix-run/react/dist/transition'

type Field<SchemaType> = {
  shape: ZodTypeAny
  fieldType: FieldType
  name: keyof SchemaType
  required: boolean
  label?: string
  options?: Option[]
  errors?: string[]
  autoFocus?: boolean
  value?: any
  hidden?: boolean
  multiline?: boolean
  placeholder?: string
}

type FieldComponent<Schema extends SomeZodObject> =
  React.ForwardRefExoticComponent<FieldProps<Schema> & React.RefAttributes<any>>

type RenderFieldProps<Schema extends SomeZodObject> = Field<z.infer<Schema>> & {
  Field: FieldComponent<Schema>
}

type RenderField<Schema extends SomeZodObject> = (
  props: RenderFieldProps<Schema>,
) => JSX.Element

type Option = { name: string } & Required<
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
    transition: FormTransition
  } & UseFormReturn<z.infer<Schema>, any>,
) => React.ReactNode

type FormTransition =
  | (Fetcher<any> & {
      Form: any
      submit: any
      load: (href: string) => void
    })
  | Transition

type OnTransition<Schema extends SomeZodObject> = (
  helpers: {
    transition: FormTransition
  } & UseFormReturn<z.infer<Schema>, any>,
) => void

type FormProps<Schema extends SomeZodObject> = {
  component?: React.ForwardRefExoticComponent<AllRemixFormProps>
  fetcher?: Fetcher<any> & {
    Form: ReturnType<any>
    submit: ReturnType<any>
    load: (href: string) => void
  }
  mode?: keyof ValidationMode
  renderField?: RenderField<Schema>
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
  pendingButtonLabel?: string
  method?: FormMethod
  schema: Schema
  errors?: FormErrors<z.infer<Schema>>
  values?: FormValues<z.infer<Schema>>
  labels?: Partial<Record<keyof z.infer<Schema>, string>>
  placeholders?: Partial<Record<keyof z.infer<Schema>, string>>
  options?: Options<z.infer<Schema>>
  hiddenFields?: Array<keyof z.infer<Schema>>
  multiline?: Array<keyof z.infer<Schema>>
  beforeChildren?: React.ReactNode
  onTransition?: OnTransition<Schema>
  parseActionData?: (data: any) => any
  children?: Children<Schema>
} & Omit<AllRemixFormProps, 'method' | 'children'>

const fieldTypes: Record<ZodTypeName, FieldType> = {
  ZodString: 'string',
  ZodNumber: 'number',
  ZodBoolean: 'boolean',
  ZodDate: 'date',
  ZodEnum: 'string',
  ZodArray: 'array',
}

function Form<Schema extends SomeZodObject>({
  component = RemixForm,
  fetcher,
  mode = 'onSubmit',
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
  buttonLabel: rawButtonLabel = 'OK',
  pendingButtonLabel = 'OK',
  method = 'post',
  schema,
  beforeChildren,
  onTransition,
  parseActionData,
  children: childrenFn,
  labels,
  placeholders,
  options,
  hiddenFields,
  multiline,
  errors: errorsProp,
  values: valuesProp,
  ...props
}: FormProps<Schema>) {
  type SchemaType = z.infer<Schema>
  const Component = fetcher?.Form ?? component
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const submit = fetcher?.submit ?? useSubmit()
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const transition = fetcher ?? useTransition()
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const unparsedActionData = fetcher?.data ?? useActionData()

  const actionData =
    parseActionData && unparsedActionData
      ? parseActionData(unparsedActionData)
      : unparsedActionData

  const actionErrors = actionData?.errors as FormErrors<SchemaType>
  const actionValues = actionData?.values as FormValues<SchemaType>
  const errors = { ...errorsProp, ...actionErrors }
  const values = { ...valuesProp, ...actionValues }

  const form = useForm<SchemaType>({ resolver: zodResolver(schema), mode })

  const { formState } = form
  const { errors: formErrors, isValid } = formState
  const [disabled, setDisabled] = React.useState(false)

  React.useEffect(() => {
    const shouldDisable =
      mode === 'onChange' || mode === 'all'
        ? transition.state === 'submitting' || !isValid
        : transition.state === 'submitting'

    setDisabled(shouldDisable)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transition.state, formState])

  React.useEffect(() => {
    onTransition && onTransition({ transition, ...form })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transition.state])

  const onSubmit = (event: any) => {
    form.handleSubmit(() => submit(event.target))(event)
  }

  const Field = React.useMemo(
    () =>
      createField<Schema>({
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  React.useEffect(() => {
    for (const stringKey in schema.shape) {
      const key = stringKey as keyof SchemaType
      if (errors && errors[key]?.length) {
        try {
          form.setFocus(key as Path<SchemaType>)
        } catch {}
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errorsProp, unparsedActionData])

  let autoFocused = false
  let fields: Field<SchemaType>[] = []
  for (const stringKey in schema.shape) {
    const key = stringKey as keyof SchemaType
    const message = (formErrors[key] as unknown as FieldError)?.message
    const shape = schema.shape[stringKey]
    const errorsArray = (message && [message]) || (errors && errors[key])

    const fieldErrors =
      errorsArray && errorsArray.length ? errorsArray : undefined

    const autoFocus = Boolean(fieldErrors && !autoFocused)
    if (autoFocus) autoFocused = true

    const { typeName, optional, nullable, getDefaultValue, enumValues } =
      shapeInfo(shape)

    const fieldType = typeName ? fieldTypes[typeName] : 'string'
    const required = !(optional || nullable)
    const propOptions = options && options[key]

    const enumOptions = enumValues
      ? enumValues.map((value: string) => ({
          name: inferLabel(value),
          value,
        }))
      : undefined

    const rawOptions = propOptions || enumOptions

    const fieldOptions =
      rawOptions && !required
        ? ([{ name: '', value: '' }, ...(rawOptions ?? [])] as Option[])
        : rawOptions

    const label = (labels && labels[key]) || inferLabel(String(stringKey))
    const value = values && values[key]

    fields.push({
      shape,
      fieldType,
      name: stringKey,
      required,
      label,
      options: fieldOptions,
      errors: fieldErrors,
      autoFocus,
      value: value === undefined ? getDefaultValue && getDefaultValue() : value,
      hidden:
        hiddenFields && Boolean(hiddenFields.find((item) => item === key)),
      multiline: multiline && Boolean(multiline.find((item) => item === key)),
      placeholder: placeholders && placeholders[key],
    })
  }

  const globalErrors = errors?._global

  const buttonLabel =
    transition.state === 'submitting' ? pendingButtonLabel : rawButtonLabel

  if (childrenFn) {
    const children = childrenFn({
      Field,
      Errors,
      Error,
      Button,
      transition,
      ...form,
    })

    return (
      <Component method={method} onSubmit={onSubmit} {...props}>
        {beforeChildren}
        {mapChildren(children, (child) => {
          if (!React.isValidElement(child)) return child

          if (child.type === Field) {
            const { name } = child.props
            const field = fields.find((field) => field.name === name)

            const autoFocus = autoFocused
              ? field?.autoFocus
              : child.props.autoFocus

            if (!child.props.children && field) {
              return renderField({ Field, ...field, ...child.props, autoFocus })
            }

            return React.cloneElement(child, {
              shape: field?.shape,
              fieldType: field?.fieldType,
              label: field?.label,
              placeholder: field?.placeholder,
              required: field?.required,
              options: field?.options,
              value: field?.value,
              errors: field?.errors,
              hidden: field?.hidden,
              multiline: field?.multiline,
              ...child.props,
              autoFocus,
            })
          } else if (child.type === Errors) {
            if (!child.props.children && !globalErrors?.length) return null

            if (child.props.children || !globalErrors?.length) {
              return React.cloneElement(child, {
                role: 'alert',
                ...child.props,
              })
            }

            return React.cloneElement(child, {
              role: 'alert',
              children: globalErrors.map((error) => (
                <Error key={error}>{error}</Error>
              )),
              ...child.props,
            })
          } else if (child.type === Button) {
            return React.cloneElement(child, {
              disabled,
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
        <Errors role="alert">
          {globalErrors.map((error) => (
            <Error key={error}>{error}</Error>
          ))}
        </Errors>
      )}
      <Button disabled={disabled}>{buttonLabel}</Button>
    </Component>
  )
}

export type { Field, RenderFieldProps, RenderField, Option, FormProps }
export { Form }
