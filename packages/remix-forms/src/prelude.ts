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

/**
 * Convert a react-hook-form dot-path to bracket notation for HTML form
 * submission. composable-functions' `inputFromForm` only parses bracket
 * notation, so all nested `name` attributes must use this format.
 *
 * @example
 * ```ts
 * dotToBracket('contacts.0.name') // 'contacts[0][name]'
 * dotToBracket('tags.0')          // 'tags[0]'
 * dotToBracket('billing.street')  // 'billing[street]'
 * ```
 */
function dotToBracket(path: string): string {
  return path.replace(/\.([^.]+)/g, '[$1]')
}

export { mapObject, browser, dotToBracket }

export type { FormSchema, Infer, KeysOfStrings }
