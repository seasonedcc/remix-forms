import type { StandardSchemaV1 } from '@standard-schema/spec'

// biome-ignore lint/suspicious/noExplicitAny: react-hook-form's FieldValues requires Record<string, any>
type FormSchema = StandardSchemaV1<Record<string, any>>

type Infer<T extends StandardSchemaV1> = StandardSchemaV1.InferOutput<T>

type KeysOfStrings<T extends object> = {
  [K in keyof T]: T[K] extends string ? K : never
}[keyof T]

function mapObject<V, NewValue>(
  obj: Record<string, V>,
  mapFunction: (key: string, value: V) => [string, NewValue]
) {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => mapFunction(key, value))
  )
}

function browser(): boolean {
  return typeof document === 'object'
}

export { mapObject, browser }

export type { FormSchema, Infer, KeysOfStrings }
