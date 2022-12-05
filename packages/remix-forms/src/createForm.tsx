import * as React from 'react'
import type { SomeZodObject, z, ZodTypeAny } from 'zod'
import type {
  ComponentOrTagName,
  FormSchema,
  KeysOfStrings,
  ObjectFromSchema,
} from './prelude'
import { objectFromSchema, mapObject } from './prelude'
import type {
  UseFormReturn,
  FieldError,
  Path,
  ValidationMode,
  DeepPartial,
} from 'react-hook-form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { FormErrors, FormValues } from './mutations'
import type {
  ComponentMappings,
  FieldComponent,
  FieldType,
  Option,
} from './createField'
import { createField } from './createField'
import { mapChildren, reduceElements } from './childrenTraversal'
import { defaultRenderField } from './defaultRenderField'
import { inferLabel } from './inferLabel'
import type { ZodTypeName } from './shapeInfo'
import { shapeInfo } from './shapeInfo'
import { coerceToForm } from './coercions'

type FormMethod = 'get' | 'post' | 'put' | 'patch' | 'delete'

type BaseFormProps = {
  method?: FormMethod
  onSubmit?: React.FormEventHandler<HTMLFormElement>
  children: React.ReactNode
}

type BaseFormPropsWithHTMLAttributes =
  React.FormHTMLAttributes<HTMLFormElement> & BaseFormProps

type FormComponent = React.ForwardRefExoticComponent<BaseFormProps>

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
  } & UseFormReturn<z.infer<Schema>, any>,
) => React.ReactNode

type Transition = { state: 'idle' | 'loading' | 'submitting' }

type OnTransition<Schema extends SomeZodObject> = (
  helpers: UseFormReturn<z.infer<Schema>, any>,
) => void

type SubmitFunction = ({ target }: { target: any }) => void

type FetcherWithComponents = Transition & {
  data: any
  Form: FormComponent
  submit: SubmitFunction
}

type FormProps<Schema extends FormSchema> = ComponentMappings & {
  component?: FormComponent
  fetcher?: FetcherWithComponents
  mode?: keyof ValidationMode
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
  hiddenFields?: Array<keyof z.infer<Schema>>
  multiline?: Array<keyof z.infer<Schema>>
  radio?: Array<KeysOfStrings<z.infer<ObjectFromSchema<Schema>>>>
  autoFocus?: keyof z.infer<Schema>
  beforeChildren?: React.ReactNode
  onTransition?: OnTransition<ObjectFromSchema<Schema>>
  /** @deprecated use your custom json/useActionData in createFormAction/createForm instead */
  parseActionData?: (data: any) => any
  children?: Children<ObjectFromSchema<Schema>>
} & Omit<BaseFormPropsWithHTMLAttributes, 'children'>

const fieldTypes: Record<ZodTypeName, FieldType> = {
  ZodString: 'string',
  ZodNumber: 'number',
  ZodBoolean: 'boolean',
  ZodDate: 'date',
  ZodEnum: 'string',
}

function createForm({
  component: DefaultComponent,
  useNavigation,
  useSubmit,
  useActionData,
}: {
  component: FormComponent
  useNavigation: () => Transition
  useSubmit: () => SubmitFunction
  useActionData: () => unknown
}) {
  return function Form<Schema extends FormSchema>({
    component = DefaultComponent,
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
    radioComponent,
    checkboxWrapperComponent,
    radioGroupComponent,
    radioWrapperComponent,
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
    radio,
    autoFocus: autoFocusProp,
    errors: errorsProp,
    values: valuesProp,
    ...props
  }: FormProps<Schema>) {
    type SchemaType = z.infer<Schema>
    const Component = fetcher?.Form ?? component
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const submit = fetcher?.submit ?? useSubmit()
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const transition = fetcher ?? useNavigation()
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

    const schemaShape = objectFromSchema(schema).shape
    const defaultValues = mapObject(schemaShape, (key, fieldShape) => {
      const shape = shapeInfo(fieldShape as z.ZodTypeAny)
      const defaultValue = coerceToForm(
        values[key] ?? shape?.getDefaultValue?.(),
        shape,
      )

      return [key, defaultValue]
    }) as DeepPartial<SchemaType>

    const form = useForm<SchemaType>({
      resolver: zodResolver(schema),
      mode,
      defaultValues,
    })

    const { formState, reset } = form
    const { errors: formErrors, isValid } = formState

    const onSubmit = (event: any) => {
      form.handleSubmit(() => submit(event.target))(event)
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
      // eslint-disable-next-line react-hooks/exhaustive-deps
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
      ],
    )

    const fieldErrors = (key: keyof SchemaType) => {
      const message = (formErrors[key] as unknown as FieldError)?.message
      return (message && [message]) || (errors && errors[key])
    }
    const firstErroredField = Object.keys(schemaShape).find(
      (key) => fieldErrors(key)?.length,
    )
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
        fieldOptions && [{ name: '', value: '' }, ...(fieldOptions ?? [])]

      return {
        shape,
        fieldType: typeName ? fieldTypes[typeName] : 'string',
        name: key,
        required,
        dirty: key in formState.dirtyFields,
        label: (labels && labels[key]) || inferLabel(String(key)),
        options: required ? fieldOptions : fieldOptionsPlusEmpty(),
        errors: fieldErrors(key),
        autoFocus: key === firstErroredField || key === autoFocusProp,
        value: defaultValues[key],
        hidden:
          hiddenFields && Boolean(hiddenFields.find((item) => item === key)),
        multiline: multiline && Boolean(multiline.find((item) => item === key)),
        radio: radio && Boolean(radio.find((item) => item === key)),
        placeholder: placeholders && placeholders[key],
      } as Field<SchemaType>
    }

    const globalErrors = errors?._global

    const buttonLabel =
      transition.state === 'submitting' ? pendingButtonLabel : rawButtonLabel

    const [disabled, setDisabled] = React.useState(false)

    const customChildren = mapChildren(
      childrenFn?.({
        Field,
        Errors,
        Error,
        Button,
        ...form,
      }),
      (child) => {
        if (child.type === Field) {
          const { name } = child.props
          const field = makeField(name)

          const autoFocus = firstErroredField
            ? field?.autoFocus
            : child.props.autoFocus ?? field?.autoFocus

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
      },
    )

    const defaultChildren = () => (
      <>
        {Object.keys(schemaShape)
          .map(makeField)
          .map((field) => renderField({ Field, ...field }))}
        {globalErrors?.length && (
          <Errors role="alert">
            {globalErrors.map((error) => (
              <Error key={error}>{error}</Error>
            ))}
          </Errors>
        )}
        <Button disabled={disabled}>{buttonLabel}</Button>
      </>
    )

    React.useEffect(() => {
      const shouldDisable =
        mode === 'onChange' || mode === 'all'
          ? transition.state === 'submitting' || !isValid
          : transition.state === 'submitting'

      setDisabled(shouldDisable)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [transition.state, formState])

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
      if (firstErroredField) {
        try {
          form.setFocus(firstErroredField as Path<SchemaType>)
        } catch { }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [errorsProp, unparsedActionData])

    React.useEffect(() => {
      onTransition && onTransition(form)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [transition.state])

    return (
      <Component method={method} onSubmit={onSubmit} {...props}>
        {beforeChildren}
        {customChildren ?? defaultChildren()}
      </Component>
    )
  }
}

export type { Field, RenderFieldProps, RenderField, FormProps, FormSchema }
export { createForm }
