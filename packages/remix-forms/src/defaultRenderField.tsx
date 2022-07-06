import * as React from 'react'
import { SomeZodObject } from 'zod'
import { RenderFieldProps } from './Form'

export default function defaultRenderField<Schema extends SomeZodObject>({
  Field,
  name,
  ...props
}: RenderFieldProps<Schema>) {
  return <Field key={String(name)} name={name} {...props} />
}
