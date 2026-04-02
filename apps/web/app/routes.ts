import {
  type RouteConfig,
  index,
  layout,
  route,
} from '@react-router/dev/routes'
import { kebabCase } from 'lodash-es'

export const exampleRouteGroups = {
  Actions: [
    'Redirect',
    'Without redirect',
    'Custom response',
    'Context',
    'Global error',
    'Field error',
    'Transform values',
  ],
  Modes: ['onSubmit', 'onBlur', 'onChange'],
  'Scalar schemas': [
    'Strings',
    'Numbers',
    'Booleans',
    'Dates',
    'Enums',
    'Zod Effects',
    'File upload',
  ],
  'Array schemas': [
    'Array of strings',
    'Array of objects',
    'Array with children',
    'Object array with children',
    'Array of arrays',
  ],
  'Object schemas': ['Nested object', 'Object with children', 'Deeply nested'],
  Forms: [
    'Auto-generated',
    'Labels, options, etc',
    'Radio buttons',
    'Hidden field',
    'Edit values',
    'Input types',
    'Form with children',
    'Field with children',
    'Fields component',
    'Field layout',
    'Custom input',
    'Async validation',
    'useFetcher',
    'useFormState',
    'useField',
    'Multiple forms',
    'Imperative submit',
    'Dynamic form',
    'Empty option label',
    'Auto complete',
    'Chakra UI',
  ],
  renderForm: ['Pending UI', 'Errors first', 'Custom wrapper', 'Global layout'],
  renderScalarField: [
    'Required indicator',
    'Error indicator',
    'Dirty indicator',
    'Inline checkboxes',
    'Global render scalar field',
  ],
}

const testRoutes = [
  'button-name-value',
  'fetcher-with-other-forms-error',
  'field-with-radio-children',
  'field-with-ref',
  'fields-component',
  'hidden-field-with-custom-children',
  'hidden-field-with-errors',
  'accented-options',
]

export const exampleRoutesToPrerender = Object.entries(exampleRouteGroups)
  .flatMap(([group, paths]) =>
    paths.map((path) => `/examples/${kebabCase(group)}/${kebabCase(path)}`)
  )
  // Async validation example has a loader with dynamic response depending
  // on the search params. Thus, it can't be pre-rendered
  .filter((path) => !path.endsWith('async-validation'))

export default [
  index('./routes/home.tsx'),
  route('get-started', './routes/get-started.tsx'),
  route('success', './routes/success.tsx'),
  layout('./routes/examples/layout.tsx', [
    route('/examples', './routes/examples/index.ts'),
    ...Object.entries(exampleRouteGroups).flatMap(([group, paths]) =>
      paths.map((path) =>
        route(
          `examples/${kebabCase(group)}/${kebabCase(path)}`,
          `./routes/examples/${kebabCase(path)}.tsx`
        )
      )
    ),
    ...testRoutes.map((path) =>
      route(`/test-examples/${path}`, `./routes/tests/${path}.tsx`)
    ),
  ]),
] satisfies RouteConfig
