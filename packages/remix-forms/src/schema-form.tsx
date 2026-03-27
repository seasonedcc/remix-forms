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
import { defaultRenderForm } from './default-render-form'
import type {
  ComponentMap,
  MergeComponents,
  NoOverrides,
  ReactRouterFormProps,
  ResolveComponents,
} from './defaults'
import { defaultComponents } from './defaults'
import { FieldsSentinel, expandFieldsSentinel } from './fields-sentinel'
import { makeFileResolver } from './file-resolver'
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
  accept?: string
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
type RenderFieldProps<
  Schema extends FormSchema,
  // biome-ignore lint/suspicious/noExplicitAny: resolved map varies per call site
  Resolved extends Record<string, any>,
  Multiline extends ReadonlyArray<keyof Infer<Schema>>,
  Radio extends ReadonlyArray<keyof Infer<Schema>>,
  Hidden extends ReadonlyArray<keyof Infer<Schema>>,
> = Field<Infer<Schema>> & {
  Field: FieldComponent<Schema, Resolved, Multiline, Radio, Hidden>
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
type RenderField<
  Schema extends FormSchema,
  // biome-ignore lint/suspicious/noExplicitAny: resolved map varies per call site
  Resolved extends Record<string, any>,
  Multiline extends ReadonlyArray<keyof Infer<Schema>>,
  Radio extends ReadonlyArray<keyof Infer<Schema>>,
  Hidden extends ReadonlyArray<keyof Infer<Schema>>,
> = (
  props: RenderFieldProps<Schema, Resolved, Multiline, Radio, Hidden>
) => JSX.Element

/**
 * Props passed to a custom form rendering function.
 *
 * Extends the same helpers available via the `children` render prop with
 * extra context about the form's current state: the `fetcher` instance,
 * the computed `disabled` flag and the resolved `buttonLabel`.
 *
 * @example
 * ```tsx
 * const myRenderForm = ({ Fields, Errors, Button }) => (
 *   <>
 *     <Fields />
 *     <Errors />
 *     <Button />
 *   </>
 * )
 * ```
 */
type RenderFormProps<
  Schema extends FormSchema,
  // biome-ignore lint/suspicious/noExplicitAny: resolved map varies per call site
  Resolved extends Record<string, any>,
  Multiline extends ReadonlyArray<keyof Infer<Schema>>,
  Radio extends ReadonlyArray<keyof Infer<Schema>>,
  Hidden extends ReadonlyArray<keyof Infer<Schema>>,
> = {
  Field: FieldComponent<Schema, Resolved, Multiline, Radio, Hidden>
  Fields: Resolved['fields']
  Errors: Resolved['globalErrors']
  Error: Resolved['error']
  Button: Resolved['button']
  submit: () => void
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  fetcher: FetcherWithComponents<any> | undefined
  disabled: boolean
  buttonLabel: string
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
} & UseFormReturn<Infer<Schema>, any>

/**
 * Function signature used for rendering the form layout.
 *
 * Called when no explicit `children` prop is provided. Can be set globally
 * via {@link makeSchemaForm} so all forms share the same layout, or
 * per-form via the `renderForm` prop on {@link SchemaForm}.
 *
 * The output goes through the same processing pipeline as `children`:
 * `Fields` auto-renders all schema fields, `Errors` receives error
 * messages, and `Button` gets `disabled` and label injected.
 *
 * @example
 * ```tsx
 * const renderForm = ({ Fields, Errors, Button }) => (
 *   <>
 *     <Fields />
 *     <Errors />
 *     <Button />
 *   </>
 * )
 * ```
 */
type RenderForm<
  Schema extends FormSchema,
  // biome-ignore lint/suspicious/noExplicitAny: resolved map varies per call site
  Resolved extends Record<string, any>,
  Multiline extends ReadonlyArray<keyof Infer<Schema>>,
  Radio extends ReadonlyArray<keyof Infer<Schema>>,
  Hidden extends ReadonlyArray<keyof Infer<Schema>>,
> = (
  props: RenderFormProps<Schema, Resolved, Multiline, Radio, Hidden>
) => React.ReactNode

type Options<SchemaType> = Partial<Record<keyof SchemaType, Option[]>>

type Children<
  Schema extends FormSchema,
  // biome-ignore lint/suspicious/noExplicitAny: resolved map varies per call site
  Resolved extends Record<string, any>,
  Multiline extends ReadonlyArray<keyof Infer<Schema>>,
  Radio extends ReadonlyArray<keyof Infer<Schema>>,
  Hidden extends ReadonlyArray<keyof Infer<Schema>>,
> = (
  helpers: {
    Field: FieldComponent<Schema, Resolved, Multiline, Radio, Hidden>
    Fields: Resolved['fields']
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
  Hidden extends ReadonlyArray<keyof Infer<Schema>>,
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
    Radio,
    Hidden
  >
  renderForm?: RenderForm<
    Schema,
    MergeComponents<Base, Components>,
    Multiline,
    Radio,
    Hidden
  >
  buttonLabel?: string
  pendingButtonLabel?: string
  schema: Schema
  errors?: FormErrors<Infer<Schema>>
  values?: FormValues<Infer<Schema>>
  labels?: Partial<Record<keyof Infer<Schema>, string>>
  placeholders?: Partial<Record<keyof Infer<Schema>, string>>
  accept?: Partial<Record<keyof Infer<Schema>, string>>
  autoComplete?: Partial<
    Record<keyof Infer<Schema>, JSX.IntrinsicElements['input']['autoComplete']>
  >
  options?: Options<Infer<Schema>>
  emptyOptionLabel?: string
  hiddenFields?: Hidden
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
    Radio,
    Hidden
  >
  idPrefix?: string
  flushSync?: boolean
} & Omit<ReactRouterFormProps, 'children' | 'autoFocus' | 'autoComplete'>

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
  if (info.type === 'file') return 'file'
  if (info.type === 'array') return 'array'
  if (info.type === 'object') return 'object'
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
 * @param options - Optional configuration for the factory.
 * @param options.renderForm - Default form layout function used when no
 *   `children` or per-form `renderForm` is provided. Receives the same
 *   helpers as `children` plus `fetcher`, `disabled` and `buttonLabel`.
 * @param options.renderField - Default field rendering function used when no
 *   per-form `renderField` is provided. Receives the `Field` component plus
 *   field metadata. Each individual form can override this with its own
 *   `renderField` prop.
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
 *
 * @example
 * ```tsx
 * const SchemaForm = makeSchemaForm(
 *   { input: MyInput },
 *   {
 *     renderForm: ({ Fields, Errors, Button }) => (
 *       <>
 *         <Fields />
 *         <Errors />
 *         <Button />
 *       </>
 *     ),
 *   }
 * )
 * ```
 *
 * @example
 * ```tsx
 * const SchemaForm = makeSchemaForm(
 *   { input: MyInput },
 *   {
 *     renderField: ({ Field, name, ...props }) => (
 *       <Field key={name} name={name} {...props} />
 *     ),
 *   }
 * )
 * ```
 */
function makeSchemaForm<Base extends Partial<ComponentMap>>(
  base: Base,
  options?: {
    renderForm?: RenderForm<
      FormSchema,
      ResolveComponents<Base>,
      readonly never[],
      readonly never[],
      readonly never[]
    >
    renderField?: RenderField<
      FormSchema,
      ResolveComponents<Base>,
      readonly never[],
      readonly never[],
      readonly never[]
    >
  }
) {
  const factoryRenderForm = options?.renderForm
  const factoryRenderField = options?.renderField
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
    const Hidden extends ReadonlyArray<keyof Infer<Schema>> = readonly [],
  >({
    components: componentsProp,
    fetcher,
    mode = 'onSubmit',
    reValidateMode = 'onChange',
    renderField: renderFieldProp,
    renderForm: renderFormProp,
    buttonLabel: rawButtonLabel = 'OK',
    pendingButtonLabel,
    method = 'POST',
    schema,
    beforeChildren,
    onNavigation,
    children: childrenFn,
    labels,
    placeholders,
    accept: acceptProp,
    autoComplete: autoCompleteProp,
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
  }: SchemaFormProps<Schema, Base, Components, Multiline, Radio, Hidden>) {
    type SchemaType = Infer<Schema>
    const generatedId = React.useId()
    const idPrefix = idPrefixProp ?? generatedId

    const rc = { ...mergedBase, ...componentsProp } as Record<
      string,
      // biome-ignore lint/suspicious/noExplicitAny: widen for internal JSX rendering — generics are for the external API
      React.ComponentType<any>
    >
    const FieldsWrapper = rc.fields
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
    const hasFileFields = Object.values(fields).some(
      (info) => info.type === 'file'
    )
    const effectiveEncType =
      props.encType ?? (hasFileFields ? 'multipart/form-data' : undefined)

    const defaultValues = mapObject(fields, (key, info) => {
      const defaultValue = coerceToForm(
        values[key] ?? info.getDefaultValue?.(),
        info
      )

      return [key, defaultValue] as never
    }) as DeepPartial<SchemaType>

    const resolver = React.useMemo(
      () =>
        hasFileFields
          ? makeFileResolver(schema, fields)
          : standardSchemaResolver(schema),
      [schema]
    )

    const form = useForm<SchemaType>({
      resolver,
      mode,
      reValidateMode,
      defaultValues: defaultValues as DefaultValues<SchemaType>,
    })

    const { formState, reset } = form
    const { errors: formErrors, isValid } = formState

    const formRef = React.useRef<HTMLFormElement>(null)

    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const onSubmit = (event: any) => {
      const target = event.currentTarget ?? formRef.current
      form.handleSubmit(() => {
        if (!formRef.current) return

        return submit(target, {
          method,
          encType: effectiveEncType,
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
          Radio,
          Hidden
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
        autoComplete: autoCompleteProp?.[key],
        accept: acceptProp?.[key],
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

    const effectiveRenderForm =
      // biome-ignore lint/suspicious/noExplicitAny: factory-level renderForm uses widened generics — type safety is enforced at the consumer level
      renderFormProp ?? (factoryRenderForm as any) ?? defaultRenderForm

    const effectiveRenderField =
      // biome-ignore lint/suspicious/noExplicitAny: factory-level renderField uses widened generics — type safety is enforced at the consumer level
      renderFieldProp ?? (factoryRenderField as any) ?? defaultRenderField

    const childrenHelpers = {
      Field,
      Fields: FieldsSentinel,
      Errors,
      Error,
      Button,
      submit: doSubmit,
      ...form,
    }

    const rawChildren =
      // biome-ignore lint/suspicious/noExplicitAny: type safety is enforced on the consumer side via SchemaFormProps
      (childrenFn as ((...args: any[]) => React.ReactNode) | undefined)?.({
        ...childrenHelpers,
      })

    const rawContent =
      rawChildren ??
      // biome-ignore lint/suspicious/noExplicitAny: type safety is enforced on the consumer side via SchemaFormProps
      (effectiveRenderForm as (...args: any[]) => React.ReactNode)({
        ...childrenHelpers,
        fetcher,
        disabled,
        buttonLabel,
      })

    const expandedContent = expandFieldsSentinel(rawContent, {
      sentinelType: FieldsSentinel,
      fieldIdentity: Field,
      schemaKeys: Object.keys(fields),
      FieldsWrapper,
    })

    const renderedFieldNames = reduceElements(
      expandedContent,
      new Set<string>(),
      (set, child) => {
        if (child.type === Field && child.props.name) {
          set.add(String(child.props.name))
        }
        return set
      }
    )

    const missingHiddenFields = (hiddenFields ?? []).filter(
      (name) => !renderedFieldNames.has(String(name))
    )

    const contentWithHiddenFields =
      missingHiddenFields.length > 0
        ? React.createElement(
            React.Fragment,
            null,
            expandedContent,
            ...missingHiddenFields.map((name) =>
              // biome-ignore lint/suspicious/noExplicitAny: Field identity varies per schema — generics are for the external API
              React.createElement(Field as React.ComponentType<any>, {
                key: String(name),
                name: String(name),
              })
            )
          )
        : expandedContent

    const processedContent = mapChildren(contentWithHiddenFields, (child) => {
      if (child.type === Field) {
        const { name } = child.props
        const field = makeField(name)

        const autoFocus = firstErroredField()
          ? field?.autoFocus
          : (child.props.autoFocus ?? field?.autoFocus)

        if (!child.props.children && field) {
          return effectiveRenderField({
            Field,
            ...field,
            ...child.props,
            autoFocus,
          })
        }

        return React.cloneElement(child, {
          ...field,
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
    })

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
        reduceElements(processedContent, [] as string[][], (prev, child) => {
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

    const { encType: _encType, ...formProps } = props

    return (
      <FormProvider {...form}>
        <FormComponent
          ref={formRef}
          method={method}
          encType={effectiveEncType}
          onSubmit={onSubmit}
          {...formProps}
        >
          {beforeChildren}
          {processedContent}
        </FormComponent>
      </FormProvider>
    )
  }
}

/**
 * Schema-driven form component.
 *
 * This component is the easiest way to create a form in React Router. It
 * automatically wires up inputs with React Hook Form, handles client side
 * validation and integrates with React Router navigation state.
 * Provide a schema and the form will generate fields and labels
 * automatically.
 *
 * @param props.components - Partial component map to override base components for this form
 * @param props.fetcher - Fetcher object returned by `useFetcher()`
 * @param props.mode - Validation trigger mode for React Hook Form
 * @param props.reValidateMode - Validation mode after submission
 * @param props.renderField - Custom field rendering function. Can also be set globally via `makeSchemaForm`
 * @param props.renderForm - Custom form layout function. Called when no `children` is provided. Receives the same helpers as `children` plus `fetcher`, `disabled` and `buttonLabel`. Can also be set globally via `makeSchemaForm`
 * @param props.buttonLabel - Text shown in the submit button
 * @param props.pendingButtonLabel - Text shown while submitting
 * @param props.method - HTTP method used to submit the form
 * @param props.schema - Schema describing the form
 * @param props.beforeChildren - Elements rendered before generated fields
 * @param props.onNavigation - Callback when navigation state changes
 * @param props.children - Render function for custom layout. Receives `Field`, `Fields`, `Errors`, `Error`, `Button`, `submit` and the React Hook Form return value. Use `Fields` to render all schema fields automatically while customizing the surrounding layout
 * @param props.labels - Custom labels for form fields
 * @param props.placeholders - Placeholder text for fields
 * @param props.accept - Accept attribute for file fields, keyed by field name (e.g. `{ avatar: 'image/*' }`)
 * @param props.autoComplete - Autocomplete hints for fields
 * @param props.options - Select and radio options for fields
 * @param props.inputTypes - Custom input types per field
 * @param props.autoInputTypes - HTML input types to assign automatically based on schema format. Defaults to `['date', 'datetime-local', 'time']`
 * @param props.hiddenFields - Fields rendered as hidden inputs
 * @param props.multiline - Fields rendered with the multiline component
 * @param props.radio - Fields rendered as radio groups
 * @param props.autoFocus - Field that should receive focus initially
 * @param props.errors - Error messages keyed by field name
 * @param props.values - Initial values for fields
 * @param props.emptyOptionLabel - Label for the empty select option
 * @param props.idPrefix - Custom prefix for generated element IDs. Defaults to a `useId()` value
 * @param props.flushSync - Whether to flush React updates synchronously
 * @returns A form element ready to be used inside a React Router v7 route
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
 *
 * @example
 * ```tsx
 * <SchemaForm schema={schema}>
 *   {({ Field, Fields, Errors, Button }) => (
 *     <>
 *       <Fields>
 *         <Field name="email" label="E-mail" />
 *       </Fields>
 *       <Errors />
 *       <Button />
 *     </>
 *   )}
 * </SchemaForm>
 * ```
 */
const SchemaForm = makeSchemaForm(defaultComponents)

export type {
  AutoInputType,
  Field,
  RenderFieldProps,
  RenderField,
  RenderFormProps,
  RenderForm,
  SchemaFormProps,
  FormSchema,
}

export { SchemaForm, makeSchemaForm }
