import * as React from 'react'
import type {
  DeepPartial,
  FieldError,
  Path,
  UseFormReturn,
  ValidationMode,
} from 'react-hook-form'
import { FormProvider, useForm } from 'react-hook-form'
import {
  type FetcherWithComponents,
  Form as ReactRouterForm,
  type FormProps as ReactRouterFormProps,
  useActionData,
  useNavigation,
  useSubmit,
} from 'react-router'
import type { FieldTypeName, SchemaAdapter } from './adapters/adapter'
import type { SomeZodObject, ZodTypeAny, z } from './adapters/zod3'
import { zod3Adapter } from './adapters/zod3'
import { mapChildren, reduceElements } from './children-traversal'
import { coerceToForm } from './coerce-to-form'
import type {
  ComponentMappings,
  FieldComponent,
  FieldType,
  Option,
} from './create-field'
import { createField } from './create-field'
import { defaultRenderField } from './default-render-field'
import { inferLabel } from './infer-label'
import type { FormErrors, FormValues } from './mutations'
import type {
  ComponentOrTagName,
  FormSchema,
  KeysOfStrings,
  ObjectFromSchema,
} from './prelude'
import { browser, mapObject, objectFromSchema } from './prelude'

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
  autoComplete?: JSX.IntrinsicElements['input']['autoComplete']
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  value?: any
  hidden?: boolean
  multiline?: boolean
  radio?: boolean
  placeholder?: string
}

/**
 * Props passed to a custom field rendering component.
 *
 * When using the {@link SchemaForm.renderField | renderField} prop you
 * receive these props for each field in the schema. They include the built
 * in `Field` component plus the computed metadata for that particular form
 * field.
 *
 * @example
 * ```tsx
 * const MyField = ({ Field, name }) => <Field name={name} />
 * ```
 *
 * @example
 * ```tsx
 * const MyField = ({ errors }) => <span>{errors?.join(',')}</span>
 * ```
 */
type RenderFieldProps<Schema extends SomeZodObject> = Field<z.infer<Schema>> & {
  Field: FieldComponent<Schema>
}

/**
 * Function signature used for rendering form fields.
 *
 * The function is called once for every key in the provided schema and
 * should return the JSX that renders that field.
 *
 * @example
 * ```tsx
 * const renderField = ({ Field, ...props }) => <Field {...props} />
 * ```
 *
 * @example
 * ```tsx
 * const renderField = ({ name }) => <input name={String(name)} />
 * ```
 */
type RenderField<Schema extends SomeZodObject> = (
  props: RenderFieldProps<Schema>
) => JSX.Element

type Options<SchemaType> = Partial<Record<keyof SchemaType, Option[]>>

type Children<Schema extends SomeZodObject> = (
  helpers: {
    Field: FieldComponent<Schema>
    Errors: ComponentOrTagName<'div'>
    Error: ComponentOrTagName<'div'>
    Button: ComponentOrTagName<'button'>
    submit: () => void
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  } & UseFormReturn<z.infer<Schema>, any>
) => React.ReactNode

type OnNavigation<Schema extends SomeZodObject> = (
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  helpers: UseFormReturn<z.infer<Schema>, any>
) => void

/**
 * Props accepted by {@link SchemaForm}.
 *
 * These options control how the form is rendered and where values and errors
 * come from. In the simplest case you only need to pass a {@link FormSchema}
 * but every aspect of the UI can be customised via these props.
 *
 * @example
 * ```tsx
 * <SchemaForm schema={schema} />
 * ```
 *
 * @example
 * ```tsx
 * <SchemaForm schema={schema} renderField={({ Field, ...f }) => <Field {...f} />} />
 * ```
 */
type SchemaFormProps<Schema extends FormSchema> = ComponentMappings & {
  component?: typeof ReactRouterForm
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
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
  adapter?: SchemaAdapter
} & Omit<ReactRouterFormProps, 'children' | 'autoFocus'>

const fieldTypes: Record<FieldTypeName, FieldType> = {
  string: 'string',
  number: 'number',
  boolean: 'boolean',
  date: 'date',
  enum: 'string',
}
/**

 *
 * This component is the easiest way to create a form in Remix. It
 * automatically wires up inputs with React Hook Form, handles client side
 * validation and integrates with React Router navigation state.
 * Provide a schema and the form will generate fields and labels
 * automatically.
 *
 * @param props.component - Form component used for rendering
 * @param props.fetcher - Fetcher object returned by `useFetcher()`
 * @param props.mode - Validation trigger mode for React Hook Form
 * @param props.reValidateMode - Validation mode after submission
 * @param props.renderField - Custom field rendering function
 * @param props.fieldComponent - Component used for each field container
 * @param props.labelComponent - Component used for labels
 * @param props.inputComponent - Component used for standard inputs
 * @param props.multilineComponent - Component used for multiline inputs
 * @param props.selectComponent - Component used for select inputs
 * @param props.checkboxComponent - Component used for checkbox inputs
 * @param props.radioComponent - Component used for radio inputs
 * @param props.checkboxWrapperComponent - Wrapper around checkbox inputs
 * @param props.radioGroupComponent - Wrapper around radio options
 * @param props.radioWrapperComponent - Wrapper around individual radio inputs
 * @param props.globalErrorsComponent - Component for rendering global errors
 * @param props.fieldErrorsComponent - Component for rendering per-field errors
 * @param props.errorComponent - Component for rendering error messages
 * @param props.buttonComponent - Component used for the submit button
 * @param props.buttonLabel - Text shown in the submit button
 * @param props.pendingButtonLabel - Text shown while submitting
 * @param props.method - HTTP method used to submit the form
 * @param props.schema - Zod schema describing the form
 * @param props.beforeChildren - Elements rendered before generated fields
 * @param props.onNavigation - Callback when navigation state changes
 * @param props.children - Custom content instead of the default layout
 * @param props.labels - Custom labels for form fields
 * @param props.placeholders - Placeholder text for fields
 * @param props.options - Select and radio options for fields
 * @param props.inputTypes - Custom input types per field
 * @param props.hiddenFields - Fields rendered as hidden inputs
 * @param props.multiline - Fields rendered with the multiline component
 * @param props.radio - Fields rendered as radio groups
 * @param props.autoFocus - Field that should receive focus initially
 * @param props.errors - Error messages keyed by field name
 * @param props.values - Initial values for fields
 * @param props.emptyOptionLabel - Label for the empty select option
 * @param props.flushSync - Whether to flush React updates synchronously
 * @param props.adapter - Library adapter used for validation
 * @returns A form element ready to be used inside a React Router v7 route
 *
 * @example
 * ```tsx
 * const schema = z.object({ name: z.string() })
 *
 * export default function Route() {
 *   return <SchemaForm schema={schema} />
 * }
 * ```
 *
 * @example
 * ```tsx
 * const fetcher = useFetcher()
 * <SchemaForm schema={schema} fetcher={fetcher} />
 * ```
 */
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
  adapter = zod3Adapter,
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
    [errorsProp, actionErrors]
  )

  const values = React.useMemo(
    () => ({ ...valuesProp, ...actionValues }),
    [valuesProp, actionValues]
  )

  const schemaShape = objectFromSchema(schema, adapter).shape
  const defaultValues = mapObject(schemaShape, (key, fieldShape) => {
    const info = adapter.getFieldInfo(fieldShape)
    const defaultValue = coerceToForm(
      values[key] ?? info?.getDefaultValue?.(),
      info
    )

    return [key, defaultValue] as never
  }) as DeepPartial<SchemaType>

  const form = useForm<SchemaType>({
    resolver: adapter.resolver(schema),
    mode,
    reValidateMode,
    defaultValues,
  })

  const { formState, reset } = form
  const { errors: formErrors, isValid } = formState

  const formRef = React.useRef<HTMLFormElement>(null)

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
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
      new Event('submit', { cancelable: true, bubbles: true })
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
        adapter,
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
      adapter,
    ]
  )

  const fieldErrors = React.useCallback(
    (key: keyof SchemaType) => {
      const message = (formErrors[key] as unknown as FieldError)?.message
      return browser() ? message && [message] : errors?.[key]
    },
    [errors, formErrors]
  )

  const firstErroredField = () =>
    Object.keys(schemaShape).find((key) => fieldErrors(key)?.length)

  const makeField = (key: string) => {
    const shape = schemaShape[key]
    const { typeName, optional, nullable, enumValues } =
      adapter.getFieldInfo(shape)

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
      label: labels?.[key] || inferLabel(String(key)),
      options: required ? fieldOptions : fieldOptionsPlusEmpty(),
      errors: fieldErrors(key),
      autoFocus: key === firstErroredField() || key === autoFocusProp,
      value: defaultValues[key],
      hidden:
        hiddenFields && Boolean(hiddenFields.find((item) => item === key)),
      multiline: multiline && Boolean(multiline.find((item) => item === key)),
      radio: radio && Boolean(radio.find((item) => item === key)),
      placeholder: placeholders?.[key],
    } as Field<SchemaType>
  }

  const hiddenFieldsErrorsToGlobal = React.useCallback(
    (globalErrors: string[] = []) => {
      const deepHiddenFieldsErrors = hiddenFields?.map((hiddenField) => {
        const hiddenFieldErrors = fieldErrors(hiddenField)

        if (Array.isArray(hiddenFieldErrors)) {
          const hiddenFieldLabel =
            labels?.[hiddenField] || inferLabel(String(hiddenField))
          return hiddenFieldErrors.map(
            (error) => `${hiddenFieldLabel}: ${error}`
          )
        }
        return []
      })
      const hiddenFieldsErrors: string[] = deepHiddenFieldsErrors?.flat() || []

      const allGlobalErrors = ([] as string[])
        .concat(globalErrors, hiddenFieldsErrors)
        .filter((error) => typeof error === 'string')

      return allGlobalErrors.length > 0 ? allGlobalErrors : undefined
    },
    [fieldErrors, hiddenFields, labels]
  )

  const globalErrors = React.useMemo(
    () => hiddenFieldsErrorsToGlobal(errors?._global),
    [errors?._global, hiddenFieldsErrorsToGlobal]
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
      }
      if (child.type === Errors) {
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
      }
      if (child.type === Button) {
        const onClick = ['button', 'reset'].includes(child.props.type)
          ? undefined
          : onSubmit

        return React.cloneElement(child, {
          disabled,
          children: buttonLabel,
          onClick,
          ...child.props,
        })
      }
      return child
    }
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
      })
    )
    reset({ ...defaultValues, ...newDefaults })
  }, [])

  React.useEffect(() => {
    Object.keys(errors).forEach((key) => {
      form.setError(key as Path<z.TypeOf<Schema>>, {
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
    onNavigation?.(form)
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

export { SchemaForm, coerceToForm }
