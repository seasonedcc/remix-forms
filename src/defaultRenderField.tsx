import { SomeZodObject } from 'zod'
import { RenderFieldProps } from './Form'

export default function defaultRenderField<Schema extends SomeZodObject>({
  Field,
  fieldType,
  name,
  label,
  options,
  errors,
  value,
  hidden,
  multiline,
}: RenderFieldProps<Schema>) {
  return (
    <Field
      key={String(name)}
      fieldType={fieldType}
      name={name}
      label={label}
      options={options}
      errors={errors}
      value={value}
      hidden={hidden}
      multiline={multiline}
    />
  )
}
