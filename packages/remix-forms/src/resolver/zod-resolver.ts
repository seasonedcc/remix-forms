import { type FieldError, appendErrors } from 'react-hook-form'
import type { z } from 'zod'
import { toNestErrors } from './to-nest-errors'
import type { Resolver } from './types'
import { validateFieldsNatively } from './validate-fields-natively'

const isZodError = (error: unknown): error is z.ZodError =>
  error !== null &&
  typeof error === 'object' &&
  'issues' in error &&
  Array.isArray(error.issues)

const parseErrorSchema = (
  zodErrors: z.core.$ZodIssue[],
  validateAllFieldCriteria: boolean
): Record<string, FieldError> => {
  const processErrors = (
    queue: z.core.$ZodIssue[],
    errors: Record<string, FieldError>
  ): Record<string, FieldError> => {
    if (queue.length === 0) {
      return errors
    }

    const [error, ...rest] = queue
    const { code, message, path } = error
    const _path = path.join('.')

    let updatedErrors = errors
    let updatedQueue = rest

    if (!updatedErrors[_path]) {
      if (error.code === 'invalid_union' && 'errors' in error) {
        const unionError = error.errors[0]?.[0]

        if (unionError) {
          updatedErrors = {
            ...updatedErrors,
            [_path]: {
              message: unionError.message,
              type: unionError.code,
            },
          }
        }
      } else {
        updatedErrors = {
          ...updatedErrors,
          [_path]: { message, type: code },
        }
      }
    }

    if (error.code === 'invalid_union' && 'errors' in error) {
      const flattenedErrors = error.errors.flat()
      updatedQueue = [...updatedQueue, ...flattenedErrors]
    }

    if (validateAllFieldCriteria) {
      const types = updatedErrors[_path].types
      const messages = types?.[error.code]

      updatedErrors = {
        ...updatedErrors,
        [_path]: appendErrors(
          _path,
          validateAllFieldCriteria,
          updatedErrors,
          code,
          messages
            ? ([] as string[]).concat(messages as string[], error.message)
            : error.message
        ) as FieldError,
      }
    }

    return processErrors(updatedQueue, updatedErrors)
  }

  return processErrors(zodErrors, {})
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
