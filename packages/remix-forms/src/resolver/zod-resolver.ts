import { type FieldError, appendErrors } from 'react-hook-form'
import type { z } from 'zod'
import { toNestErrors } from './toNestErrors'
import type { Resolver } from './types'
import { validateFieldsNatively } from './validateFieldsNatively'

const isZodError = (error: unknown): error is z.ZodError =>
  error !== null &&
  typeof error === 'object' &&
  'issues' in error &&
  Array.isArray(error.issues)

const parseErrorSchema = (
  zodErrors: z.core.$ZodIssue[],
  validateAllFieldCriteria: boolean
) => {
  const errors: Record<string, FieldError> = {}
  while (zodErrors.length) {
    const error = zodErrors[0]
    const { code, message, path } = error
    const _path = path.join('.')

    if (!errors[_path]) {
      if (error.code === 'invalid_union' && 'errors' in error) {
        const unionError = error.errors[0]?.[0]

        if (unionError) {
          errors[_path] = {
            message: unionError.message,
            type: unionError.code,
          }
        }
      } else {
        errors[_path] = { message, type: code }
      }
    }

    if (error.code === 'invalid_union' && 'errors' in error) {
      error.errors.forEach((errorGroup) =>
        errorGroup.forEach((e) => zodErrors.push(e))
      )
    }

    if (validateAllFieldCriteria) {
      const types = errors[_path].types
      const messages = types?.[error.code]

      errors[_path] = appendErrors(
        _path,
        validateAllFieldCriteria,
        errors,
        code,
        messages
          ? ([] as string[]).concat(messages as string[], error.message)
          : error.message
      ) as FieldError
    }

    zodErrors.shift()
  }

  return errors
}

export const zodResolver: Resolver =
  (schema, schemaOptions, resolverOptions = {}) =>
  async (values, _, options) => {
    try {
      if (resolverOptions.mode === 'sync') {
        schema.parse(values, schemaOptions)
      } else {
        await schema.parseAsync(values, schemaOptions)
      }

      options.shouldUseNativeValidation && validateFieldsNatively({}, options)

      return {
        values,
        errors: {},
      }
    } catch (error: unknown) {
      if (isZodError(error)) {
        return {
          values: {},
          errors: toNestErrors(
            parseErrorSchema(
              error.issues,
              !options.shouldUseNativeValidation &&
                options.criteriaMode === 'all'
            ),
            options
          ),
        }
      }

      throw error
    }
  }
