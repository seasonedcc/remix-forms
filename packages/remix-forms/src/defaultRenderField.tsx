import * as React from 'react'
import type { SomeZodObject } from 'zod'
import type { RenderFieldProps } from './createForm'

function defaultRenderField<Schema extends SomeZodObject>({
  Field,
  name,
  ...props
}: RenderFieldProps<Schema>) {
  return <Field key={String(name)} name={name} {...props} />
}

export { defaultRenderField }
