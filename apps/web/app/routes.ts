import {
  type RouteConfig,
  index,
  layout,
  route,
} from '@react-router/dev/routes'
import { kebabCase } from 'lodash-es'
import { times } from './helpers'

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
  Schemas: [
    'Strings',
    'Numbers',
    'Booleans',
    'Dates',
    'Enums',
    'Zod Effects',
    'Array of strings',
    'Array of objects',
  ],
  Forms: [
    'Auto-generated',
    'Labels, options, etc',
    'Radio buttons',
    'Hidden field',
    'Edit values',
    'Input types',
    'Form with children',
    'Field with children',
    'Field layout',
    'Custom input',
    'Async validation',
    'useFetcher',
    'useFormState',
    'useField',
    'Multiple forms',
    'Imperative submit',
    'Dynamic form',
  ],
  renderField: [
    'Required indicator',
    'Error indicator',
    'Dirty indicator',
    'Inline checkboxes',
  ],
}

const testRoutes = [
  'fetcher-with-other-forms-error',
  'field-with-radio-children',
  'field-with-ref',
  'hidden-field-with-errors',
]

export const exampleRoutesToPrerender = Object.entries(exampleRouteGroups)
  .flatMap(([group, paths]) =>
    paths.map((path) => `/examples/${kebabCase(group)}/${kebabCase(path)}`)
  )
  // Async validation example has a loader with dynamic response depending
  // on the search params. Thus, it can't be pre-rendered
  .filter((path) => !path.endsWith('async-validation'))

export const confRoutes = times(9, (i) => `/conf/${String(i).padStart(2, '0')}`)

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
  layout('./routes/conf/layout.tsx', [
    route('conf', './routes/conf/index.tsx'),
    ...confRoutes.map((path) => route(path, `./routes${path}.tsx`)),
  ]),
  route('conf/success/:referrer', './routes/conf/success.tsx'),
] satisfies RouteConfig
