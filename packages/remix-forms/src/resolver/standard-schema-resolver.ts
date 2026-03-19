import type { StandardSchemaV1 } from '@standard-schema/spec'
import { type FieldError, appendErrors } from 'react-hook-form'
import { toNestErrors } from './to-nest-errors'
import type { Resolver } from './types'
import { validateFieldsNatively } from './validate-fields-natively'

function issuePath(issue: StandardSchemaV1.Issue): string {
  if (!issue.path) return ''
  return issue.path
    .map((segment) =>
      typeof segment === 'object' && segment !== null && 'key' in segment
        ? segment.key
        : segment
    )
    .join('.')
}

const parseIssues = (
  issues: readonly StandardSchemaV1.Issue[],
  validateAllFieldCriteria: boolean
): Record<string, FieldError> => {
  const errors: Record<string, FieldError> = {}

  for (const issue of issues) {
    const path = issuePath(issue)

    if (!errors[path]) {
      errors[path] = { message: issue.message, type: 'validation' }
    }

    if (validateAllFieldCriteria) {
      const types = errors[path].types
      const messages = types?.validation

      errors[path] = appendErrors(
        path,
        validateAllFieldCriteria,
        errors,
        'validation',
        messages
          ? ([] as string[]).concat(messages as string[], issue.message)
          : issue.message
      ) as FieldError
    }
  }

  return errors
}

export const schemaResolver: Resolver =
  (schema) => async (values, _, options) => {
    const result = await schema['~standard'].validate(values)

    if (!result.issues) {
      options.shouldUseNativeValidation && validateFieldsNatively({}, options)

      return {
        values,
        errors: {},
      }
    }

    return {
      values: {},
      errors: toNestErrors(
        parseIssues(
          result.issues,
          !options.shouldUseNativeValidation && options.criteriaMode === 'all'
        ),
        options
      ),
    }
  }
