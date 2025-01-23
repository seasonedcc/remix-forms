import * as React from 'react'
import type { SomeZodObject, TypeOf, z, ZodTypeAny } from 'zod'
import type {
  ComponentOrTagName,
  FormSchema,
  KeysOfStrings,
  ObjectFromSchema,
} from './prelude'
import { objectFromSchema, mapObject, browser } from './prelude'
import type {
  UseFormReturn,
  FieldError,
  Path,
  ValidationMode,
  DeepPartial,
} from 'react-hook-form'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { FormErrors, FormValues } from './mutations'
import type {
  ComponentMappings,
  FieldComponent,
  FieldType,
  Option,
} from './create-field'
import { createField } from './create-field'
import { mapChildren, reduceElements } from './children-traversal'
import { defaultRenderField } from './default-render-field'
import { inferLabel } from './infer-label'
import type { ZodTypeName } from './shape-info'
import { shapeInfo } from './shape-info'
import type { ShapeInfo } from './shape-info'
import { parseDate } from './prelude'
import {
  Form as ReactRouterForm,
  FetcherWithComponents,
  useActionData,
  useNavigation,
  useSubmit,
  type FormProps as ReactRouterFormProps,
} from 'react-router'

type Field<SchemaType> = {
  shape: ZodTypeAny
  fieldType: FieldType
  name: keyof SchemaType
  required: boolean
  dirty: boolean
  label?: string
  options?: Option[]
  errors?: string[]
  autoFocus?: boolean
  value?: any
  hidden?: boolean
  multiline?: boolean
  radio?: boolean
  placeholder?: string
}

type RenderFieldProps<Schema extends SomeZodObject> = Field<z.infer<Schema>> & {
  Field: FieldComponent<Schema>
}

type RenderField<Schema extends SomeZodObject> = (
  props: RenderFieldProps<Schema>,
) => JSX.Element

type Options<SchemaType> = Partial<Record<keyof SchemaType, Option[]>>

type Children<Schema extends SomeZodObject> = (
  helpers: {
    Field: FieldComponent<Schema>
    Errors: ComponentOrTagName<'div'>
    Error: ComponentOrTagName<'div'>
    Button: ComponentOrTagName<'button'>
    submit: () => void
  } & UseFormReturn<z.infer<Schema>, any>,
) => React.ReactNode

type OnNavigation<Schema extends SomeZodObject> = (
  helpers: UseFormReturn<z.infer<Schema>, any>,
) => void

type SchemaFormProps<Schema extends FormSchema> = ComponentMappings & {
  component?: typeof ReactRouterForm
  fetcher?: FetcherWithComponents<any>
  mode?: keyof ValidationMode
  reValidateMode?: keyof Pick<
    ValidationMode,
    'onBlur' | 'onChange' | 'onSubmit'
  >
  renderField?: RenderField<ObjectFromSchema<Schema>>
  globalErrorsComponent?: ComponentOrTagName<'div'>
  buttonComponent?: ComponentOrTagName<'button'>
  buttonLabel?: string
  pendingButtonLabel?: string
  schema: Schema
  errors?: FormErrors<z.infer<Schema>>
  values?: FormValues<z.infer<Schema>>
  labels?: Partial<Record<keyof z.infer<Schema>, string>>
  placeholders?: Partial<Record<keyof z.infer<Schema>, string>>
  options?: Options<z.infer<Schema>>
  emptyOptionLabel?: string
  hiddenFields?: Array<keyof z.infer<Schema>>
  inputTypes?: Partial<
    Record<keyof z.infer<Schema>, React.HTMLInputTypeAttribute>
  >
  multiline?: Array<keyof z.infer<Schema>>
  radio?: Array<KeysOfStrings<z.infer<ObjectFromSchema<Schema>>>>
  autoFocus?: keyof z.infer<Schema>
  beforeChildren?: React.ReactNode
  onNavigation?: OnNavigation<ObjectFromSchema<Schema>>
  children?: Children<ObjectFromSchema<Schema>>
  flushSync?: boolean
} & Omit<ReactRouterFormProps, 'children'>

const fieldTypes: Record<ZodTypeName, FieldType> = {
  ZodString: 'string',
  ZodNumber: 'number',
  ZodBoolean: 'boolean',
  ZodDate: 'date',
  ZodEnum: 'string',
}

function coerceToForm(value: unknown, shape: ShapeInfo) {
  const { typeName } = shape
  if (typeName === 'ZodBoolean') {
    return Boolean(value) ?? false
  }

  if (typeName === 'ZodDate') {
    return parseDate(value as Date | undefined)
  }

  if (
    typeName === 'ZodEnum' ||
    typeName === 'ZodString' ||
    typeName === 'ZodNumber'
  ) {
    return String(value ?? '')
  }

  return value ?? ''
}

function SchemaForm<Schema extends FormSchema>({
  component = ReactRouterForm,
  fetcher,
  mode = 'onSubmit',
  reValidateMode = 'onChange',
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
  radioComponent,
  checkboxWrapperComponent,
  radioGroupComponent,
  radioWrapperComponent,
  buttonComponent: Button = 'button',
  buttonLabel: rawButtonLabel = 'OK',
  pendingButtonLabel,
  method = 'POST',
  schema,
  beforeChildren,
  onNavigation,
  children: childrenFn,
  labels,
  placeholders,
  options,
  inputTypes,
  emptyOptionLabel = '',
  hiddenFields,
  multiline,
  radio,
  autoFocus: autoFocusProp,
  errors: errorsProp,
  values: valuesProp,
  flushSync,
  ...props
}: SchemaFormProps<Schema>) {
  type SchemaType = z.infer<Schema>
  const Component = fetcher?.Form ?? component
  const navigationSubmit = useSubmit()
  const submit = fetcher?.submit ?? navigationSubmit
  const navigation = useNavigation()
  const navigationState = fetcher ? fetcher.state : navigation.state
  const navigationActionData = useActionData()
  const actionData = fetcher ? fetcher.data : navigationActionData
  const actionErrors = actionData?.errors as FormErrors<SchemaType>
  const actionValues = actionData?.values as FormValues<SchemaType>

  const errors = React.useMemo(
    () => ({ ...errorsProp, ...actionErrors }),
    [errorsProp, actionErrors],
  )

  const values = React.useMemo(
    () => ({ ...valuesProp, ...actionValues }),
    [valuesProp, actionValues],
  )

  const schemaShape = objectFromSchema(schema).shape
  const defaultValues = mapObject(schemaShape, (key, fieldShape) => {
    const shape = shapeInfo(fieldShape as z.ZodTypeAny)
    const defaultValue = coerceToForm(
      values[key] ?? shape?.getDefaultValue?.(),
      shape,
    )

    return [key, defaultValue] as never
  }) as DeepPartial<SchemaType>

  const form = useForm<SchemaType>({
    resolver: zodResolver(schema),
    mode,
    reValidateMode,
    defaultValues,
  })

  const { formState, reset } = form
  const { errors: formErrors, isValid } = formState

  const formRef = React.useRef<HTMLFormElement>(null)

  const onSubmit = (event: any) => {
    form.handleSubmit(() => {
      if (!formRef.current) return

      return submit(formRef.current, {
        method,
        replace: props.replace,
        preventScrollReset: props.preventScrollReset,
        navigate: props.navigate,
        fetcherKey: props.fetcherKey,
        flushSync,
      })
    })(event)
  }

  const doSubmit = () => {
    formRef.current?.dispatchEvent(
      new Event('submit', { cancelable: true, bubbles: true }),
    )
  }

  const Field = React.useMemo(
    () =>
      createField<ObjectFromSchema<Schema>>({
        register: form.register,
        fieldComponent,
        labelComponent,
        inputComponent,
        multilineComponent,
        selectComponent,
        checkboxComponent,
        radioComponent,
        checkboxWrapperComponent,
        radioGroupComponent,
        radioWrapperComponent,
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
      radioComponent,
      checkboxWrapperComponent,
      radioGroupComponent,
      radioWrapperComponent,
      fieldErrorsComponent,
      Error,
      form.register,
    ],
  )

  const fieldErrors = React.useCallback(
    (key: keyof SchemaType) => {
      const message = (formErrors[key] as unknown as FieldError)?.message
      return browser() ? message && [message] : errors && errors[key]
    },
    [errors, formErrors],
  )

  const firstErroredField = () =>
    Object.keys(schemaShape).find((key) => fieldErrors(key)?.length)

  const makeField = (key: string) => {
    const shape = schemaShape[key]
    const { typeName, optional, nullable, enumValues } = shapeInfo(shape)

    const required = !(optional || nullable)

    const fieldOptions =
      options?.[key] ||
      enumValues?.map((value: string) => ({
        name: inferLabel(value),
        value,
      }))

    const fieldOptionsPlusEmpty = () =>
      fieldOptions && [
        { name: emptyOptionLabel, value: '' },
        ...(fieldOptions ?? []),
      ]

    return {
      shape,
      fieldType: typeName ? fieldTypes[typeName] : 'string',
      type: inputTypes?.[key],
      name: key,
      required,
      dirty: key in formState.dirtyFields,
      label: (labels && labels[key]) || inferLabel(String(key)),
      options: required ? fieldOptions : fieldOptionsPlusEmpty(),
      errors: fieldErrors(key),
      autoFocus: key === firstErroredField() || key === autoFocusProp,
      value: defaultValues[key],
      hidden:
        hiddenFields && Boolean(hiddenFields.find((item) => item === key)),
      multiline: multiline && Boolean(multiline.find((item) => item === key)),
      radio: radio && Boolean(radio.find((item) => item === key)),
      placeholder: placeholders && placeholders[key],
    } as Field<SchemaType>
  }

  const hiddenFieldsErrorsToGlobal = React.useCallback(
    (globalErrors: string[] = []) => {
      const deepHiddenFieldsErrors = hiddenFields?.map((hiddenField) => {
        const hiddenFieldErrors = fieldErrors(hiddenField)

        if (hiddenFieldErrors instanceof Array) {
          const hiddenFieldLabel =
            (labels && labels[hiddenField]) || inferLabel(String(hiddenField))
          return hiddenFieldErrors.map(
            (error) => `${hiddenFieldLabel}: ${error}`,
          )
        } else return []
      })
      const hiddenFieldsErrors: string[] = deepHiddenFieldsErrors?.flat() || []

      const allGlobalErrors = ([] as string[])
        .concat(globalErrors, hiddenFieldsErrors)
        .filter((error) => typeof error === 'string')

      return allGlobalErrors.length > 0 ? allGlobalErrors : undefined
    },
    [fieldErrors, hiddenFields, labels],
  )

  const globalErrors = React.useMemo(
    () => hiddenFieldsErrorsToGlobal(errors?._global),
    [errors?._global, hiddenFieldsErrorsToGlobal],
  )

  const buttonLabel =
    navigationState !== 'idle'
      ? (pendingButtonLabel ?? rawButtonLabel)
      : rawButtonLabel

  const [disabled, setDisabled] = React.useState(false)

  const globalErrorsToDisplay =
    navigationState !== 'idle' ? undefined : globalErrors

  const customChildren = mapChildren(
    childrenFn?.({
      Field,
      Errors,
      Error,
      Button,
      submit: doSubmit,
      ...form,
    }),
    (child) => {
      if (child.type === Field) {
        const { name } = child.props
        const field = makeField(name)

        const autoFocus = firstErroredField()
          ? field?.autoFocus
          : (child.props.autoFocus ?? field?.autoFocus)

        if (!child.props.children && field) {
          return renderField({
            Field,
            ...field,
            ...child.props,
            autoFocus,
          })
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
        if (!child.props.children && !globalErrorsToDisplay?.length) return null

        if (child.props.children || !globalErrorsToDisplay?.length) {
          return React.cloneElement(child, {
            role: 'alert',
            ...child.props,
          })
        }

        return React.cloneElement(child, {
          role: 'alert',
          children: globalErrorsToDisplay.map((error) => (
            <Error key={error}>{error}</Error>
          )),
          ...child.props,
        })
      } else if (child.type === Button) {
        const onClick = ['button', 'reset'].includes(child.props.type)
          ? undefined
          : onSubmit

        return React.cloneElement(child, {
          disabled,
          children: buttonLabel,
          onClick,
          ...child.props,
        })
      } else {
        return child
      }
    },
  )

  const defaultChildren = () => (
    <>
      {Object.keys(schemaShape)
        .map(makeField)
        .map((field) => renderField({ Field, ...field }))}
      {globalErrorsToDisplay?.length && (
        <Errors role="alert">
          {globalErrorsToDisplay.map((error) => (
            <Error key={error}>{error}</Error>
          ))}
        </Errors>
      )}
      <Button disabled={disabled}>{buttonLabel}</Button>
    </>
  )

  React.useEffect(() => {
    const submitting = navigationState !== 'idle'

    const shouldDisable =
      mode === 'onChange' || mode === 'all'
        ? submitting || !isValid
        : submitting

    setDisabled(shouldDisable)
  }, [navigationState, formState, mode, isValid])

  React.useEffect(() => {
    const newDefaults = Object.fromEntries(
      reduceElements(customChildren, [] as string[][], (prev, child) => {
        if (child.type === Field) {
          const { name, value } = child.props
          prev.push([name, value])
        }
        return prev
      }),
    )
    reset({ ...defaultValues, ...newDefaults })
  }, [])

  React.useEffect(() => {
    Object.keys(errors).forEach((key) => {
      form.setError(key as Path<TypeOf<Schema>>, {
        type: 'custom',
        message: (errors[key] ?? []).join(', '),
      })
    })
    if (firstErroredField()) {
      try {
        form.setFocus(firstErroredField() as Path<SchemaType>)
      } catch {}
    }
  }, [errorsProp, actionData])

  React.useEffect(() => {
    onNavigation && onNavigation(form)
  }, [navigationState])

  return (
    <FormProvider {...form}>
      <Component ref={formRef} method={method} onSubmit={onSubmit} {...props}>
        {beforeChildren}
        {customChildren ?? defaultChildren()}
      </Component>
    </FormProvider>
  )
}

export type {
  Field,
  RenderFieldProps,
  RenderField,
  SchemaFormProps,
  FormSchema,
}

export { SchemaForm }
