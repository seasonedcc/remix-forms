import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { coerceToForm } from 'coerce-form-data'
import * as React from 'react'
import type {
  DeepPartial,
  DefaultValues,
  FieldError,
  Path,
  UseFormReturn,
  ValidationMode,
} from 'react-hook-form'
import { FormProvider, useForm } from 'react-hook-form'
import {
  type FetcherWithComponents,
  useActionData,
  useNavigation,
  useSubmit,
} from 'react-router'
import { schemaFields } from 'schema-info'
import type { SchemaInfo } from 'schema-info'
import { mapChildren, reduceElements } from './children-traversal'
import type { FieldComponent, FieldType, Option } from './create-field'
import { createField } from './create-field'
import { defaultRenderField } from './default-render-field'
import type {
  ComponentMap,
  MergeComponents,
  NoOverrides,
  ReactRouterFormProps,
} from './defaults'
import { defaultComponents } from './defaults'
import { inferLabel } from './infer-label'
import type { FormErrors, FormValues } from './mutations'
import type { FormSchema, Infer, KeysOfStrings } from './prelude'
import { browser, mapObject } from './prelude'

/**
 * HTML input types that can be automatically inferred from a schema
 * field's {@link SchemaInfo.format | format} metadata.
 *
 * When a field's format maps to one of these input types and that type is
 * included in the {@link SchemaFormProps.autoInputTypes | autoInputTypes}
 * array, the corresponding `<input type="...">` is set automatically.
 *
 * @example
 * ```tsx
 * <SchemaForm schema={schema} autoInputTypes={['date', 'email']} />
 * ```
 */
type AutoInputType = 'date' | 'datetime-local' | 'time' | 'email' | 'url'

type Field<SchemaType> = {
  shape: SchemaInfo
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
 * @example
 * ```tsx
 * const MyField = ({ Field, name }) => <Field name={name} />
 * ```
 */
type RenderFieldProps<
  Schema extends FormSchema,
  // biome-ignore lint/suspicious/noExplicitAny: resolved map varies per call site
  Resolved extends Record<string, any>,
  Multiline extends ReadonlyArray<keyof Infer<Schema>>,
  Radio extends ReadonlyArray<keyof Infer<Schema>>,
> = Field<Infer<Schema>> & {
  Field: FieldComponent<Schema, Resolved, Multiline, Radio>
}

/**
 * Function signature used for rendering form fields.
 *
 * @example
 * ```tsx
 * const renderField = ({ Field, ...props }) => <Field {...props} />
 * ```
 */
type RenderField<
  Schema extends FormSchema,
  // biome-ignore lint/suspicious/noExplicitAny: resolved map varies per call site
  Resolved extends Record<string, any>,
  Multiline extends ReadonlyArray<keyof Infer<Schema>>,
  Radio extends ReadonlyArray<keyof Infer<Schema>>,
> = (props: RenderFieldProps<Schema, Resolved, Multiline, Radio>) => JSX.Element

type Options<SchemaType> = Partial<Record<keyof SchemaType, Option[]>>

type Children<
  Schema extends FormSchema,
  // biome-ignore lint/suspicious/noExplicitAny: resolved map varies per call site
  Resolved extends Record<string, any>,
  Multiline extends ReadonlyArray<keyof Infer<Schema>>,
  Radio extends ReadonlyArray<keyof Infer<Schema>>,
> = (
  helpers: {
    Field: FieldComponent<Schema, Resolved, Multiline, Radio>
    Errors: Resolved['globalErrors']
    Error: Resolved['error']
    Button: Resolved['button']
    submit: () => void
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  } & UseFormReturn<Infer<Schema>, any>
) => React.ReactNode

type OnNavigation<Schema extends FormSchema> = (
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  helpers: UseFormReturn<Infer<Schema>, any>
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
 * <SchemaForm schema={schema} components={{ input: MyInput }} />
 * ```
 */
type SchemaFormProps<
  Schema extends FormSchema,
  Base extends Partial<ComponentMap>,
  Components extends Partial<ComponentMap>,
  Multiline extends ReadonlyArray<keyof Infer<Schema>>,
  Radio extends ReadonlyArray<KeysOfStrings<Infer<Schema>>>,
> = {
  components?: Components
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  fetcher?: FetcherWithComponents<any>
  mode?: keyof ValidationMode
  reValidateMode?: keyof Pick<
    ValidationMode,
    'onBlur' | 'onChange' | 'onSubmit'
  >
  renderField?: RenderField<
    Schema,
    MergeComponents<Base, Components>,
    Multiline,
    Radio
  >
  buttonLabel?: string
  pendingButtonLabel?: string
  schema: Schema
  errors?: FormErrors<Infer<Schema>>
  values?: FormValues<Infer<Schema>>
  labels?: Partial<Record<keyof Infer<Schema>, string>>
  placeholders?: Partial<Record<keyof Infer<Schema>, string>>
  options?: Options<Infer<Schema>>
  emptyOptionLabel?: string
  hiddenFields?: Array<keyof Infer<Schema>>
  inputTypes?: Partial<
    Record<keyof Infer<Schema>, React.HTMLInputTypeAttribute>
  >
  autoInputTypes?: AutoInputType[]
  multiline?: Multiline
  radio?: Radio
  autoFocus?: keyof Infer<Schema>
  beforeChildren?: React.ReactNode
  onNavigation?: OnNavigation<Schema>
  children?: Children<
    Schema,
    MergeComponents<Base, Components>,
    Multiline,
    Radio
  >
  idPrefix?: string
  flushSync?: boolean
} & Omit<ReactRouterFormProps, 'children' | 'autoFocus'>

const formatToInputType: Partial<Record<string, AutoInputType>> = {
  date: 'date',
  datetime: 'datetime-local',
  time: 'time',
  email: 'email',
  url: 'url',
}

function resolveAutoInputType(
  info: SchemaInfo,
  allowedTypes: AutoInputType[]
): AutoInputType | undefined {
  if (!info.format) return undefined
  const mapped = formatToInputType[info.format]
  if (!mapped || !allowedTypes.includes(mapped)) return undefined
  return mapped
}

function uiFieldType(info: SchemaInfo): FieldType {
  if (info.type === 'enum') return 'string'
  return (info.type ?? 'string') as FieldType
}

/**
 * Create a SchemaForm component with custom base components.
 *
 * The factory captures base components as concrete types so that both
 * wrapper-level and per-form component types flow through to Field
 * children render props with full type safety.
 *
 * @param base - Partial component map providing base-level defaults.
 *   Unspecified slots fall back to the built-in defaults.
 * @returns A SchemaForm component that uses the provided base components.
 *
 * @example
 * ```tsx
 * import { makeSchemaForm } from 'remix-forms'
 *
 * const SchemaForm = makeSchemaForm({
 *   input: MyInput,
 *   button: MyButton,
 * })
 * ```
 */
function makeSchemaForm<Base extends Partial<ComponentMap>>(base: Base) {
  const mergedBase = { ...defaultComponents, ...base } as Record<
    string,
    // biome-ignore lint/suspicious/noExplicitAny: widen for internal JSX rendering — generics are for the external API
    React.ComponentType<any>
  >

  return function SchemaForm<
    Schema extends FormSchema,
    Components extends Partial<ComponentMap> = NoOverrides,
    const Multiline extends ReadonlyArray<keyof Infer<Schema>> = readonly [],
    const Radio extends ReadonlyArray<
      KeysOfStrings<Infer<Schema>>
    > = readonly [],
  >({
    components: componentsProp,
    fetcher,
    mode = 'onSubmit',
    reValidateMode = 'onChange',
    renderField = defaultRenderField,
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
    autoInputTypes = ['date', 'datetime-local', 'time'],
    emptyOptionLabel = '',
    hiddenFields,
    multiline,
    radio,
    autoFocus: autoFocusProp,
    errors: errorsProp,
    values: valuesProp,
    idPrefix: idPrefixProp,
    flushSync,
    ...props
  }: SchemaFormProps<Schema, Base, Components, Multiline, Radio>) {
    type SchemaType = Infer<Schema>
    const generatedId = React.useId()
    const idPrefix = idPrefixProp ?? generatedId

    const rc = { ...mergedBase, ...componentsProp } as Record<
      string,
      // biome-ignore lint/suspicious/noExplicitAny: widen for internal JSX rendering — generics are for the external API
      React.ComponentType<any>
    >
    const FieldsComponent = rc.fields
    const Errors = rc.globalErrors
    const Error = rc.error
    const Button = rc.button

    const FormComponent = fetcher?.Form ?? rc.form
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

    const fields = schemaFields(schema)
    const defaultValues = mapObject(fields, (key, info) => {
      const defaultValue = coerceToForm(
        values[key] ?? info.getDefaultValue?.(),
        info
      )

      return [key, defaultValue] as never
    }) as DeepPartial<SchemaType>

    const form = useForm<SchemaType>({
      resolver: standardSchemaResolver(schema),
      mode,
      reValidateMode,
      defaultValues: defaultValues as DefaultValues<SchemaType>,
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
        createField<
          Schema,
          MergeComponents<Base, Components>,
          Multiline,
          Radio
        >({
          register: form.register,
          idPrefix,
          // biome-ignore lint/suspicious/noExplicitAny: rc is the merged components — generics ensure type safety at the consumer level
          components: rc as any,
        }),
      [idPrefix, ...Object.values(componentsProp ?? {}), form.register]
    )

    const fieldErrors = React.useCallback(
      (key: keyof SchemaType & string) => {
        const message = (formErrors[key] as unknown as FieldError)?.message
        return browser() ? message && [message] : errors?.[key]
      },
      [errors, formErrors]
    )

    const firstErroredField = () =>
      Object.keys(fields).find((key) => fieldErrors(key)?.length)

    const makeField = (key: string) => {
      const info = fields[key] ?? {
        type: null,
        optional: false,
        nullable: false,
      }
      const { optional, nullable, enumValues } = info

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
        shape: info,
        fieldType: uiFieldType(info),
        type: inputTypes?.[key] ?? resolveAutoInputType(info, autoInputTypes),
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
          const hiddenFieldErrors = fieldErrors(
            hiddenField as keyof SchemaType & string
          )

          if (Array.isArray(hiddenFieldErrors)) {
            const hiddenFieldLabel =
              labels?.[hiddenField] || inferLabel(String(hiddenField))
            return hiddenFieldErrors.map(
              (error) => `${hiddenFieldLabel}: ${error}`
            )
          }
          return []
        })
        const hiddenFieldsErrors: string[] =
          deepHiddenFieldsErrors?.flat() || []

        const allGlobalErrors = ([] as string[])
          .concat(globalErrors, hiddenFieldsErrors)
          .filter((error) => typeof error === 'string')

        return allGlobalErrors.length > 0 ? allGlobalErrors : undefined
      },
      [fieldErrors, hiddenFields, labels]
    )

    const orphanedErrors = React.useMemo(() => {
      const fieldKeys = new Set(Object.keys(fields))
      return Object.entries(errors)
        .filter(([key]) => key !== '_global' && !fieldKeys.has(key))
        .flatMap(([, msgs]) => msgs ?? [])
    }, [errors, fields])

    const globalErrors = React.useMemo(
      () =>
        hiddenFieldsErrorsToGlobal([
          ...(errors?._global ?? []),
          ...orphanedErrors,
        ]),
      [errors?._global, orphanedErrors, hiddenFieldsErrorsToGlobal]
    )

    const buttonLabel =
      navigationState !== 'idle'
        ? (pendingButtonLabel ?? rawButtonLabel)
        : rawButtonLabel

    const [disabled, setDisabled] = React.useState(false)

    const globalErrorsToDisplay =
      navigationState !== 'idle' ? undefined : globalErrors

    const customChildren = mapChildren(
      // biome-ignore lint/suspicious/noExplicitAny: type safety is enforced on the consumer side via SchemaFormProps
      (childrenFn as ((...args: any[]) => React.ReactNode) | undefined)?.({
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
            radio: field?.radio,
            ...child.props,
            autoFocus,
          })
        }
        if (child.type === Errors) {
          if (!child.props.children && !globalErrorsToDisplay?.length)
            return null

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
        <FieldsComponent>
          {Object.keys(fields)
            .map(makeField)
            .map((field) => renderField({ Field, ...field }))}
        </FieldsComponent>
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
        if (key === '_global') return
        form.setError(key as Path<Infer<Schema>>, {
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
        <FormComponent
          ref={formRef}
          method={method}
          onSubmit={onSubmit}
          {...props}
        >
          {beforeChildren}
          {customChildren ?? defaultChildren()}
        </FormComponent>
      </FormProvider>
    )
  }
}

const SchemaForm = makeSchemaForm(defaultComponents)

export type {
  AutoInputType,
  Field,
  RenderFieldProps,
  RenderField,
  SchemaFormProps,
  FormSchema,
}

export { SchemaForm, makeSchemaForm }
