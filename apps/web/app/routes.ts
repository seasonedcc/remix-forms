import { index, layout, route, RouteConfig } from '@react-router/dev/routes'
import { times } from './helpers'

const exampleRouteGroups = {
  actions: [
    'context',
    'redirect',
    'custom-response',
    'field-error',
    'global-error',
    'transform-values',
    'without-redirect',
  ],
  forms: [
    'async-validation',
    'auto-generated',
    'custom-input',
    'dynamic-form',
    'edit-values',
    'field-layout',
    'field-with-children',
    'form-with-children',
    'hidden-field',
    'imperative-submit',
    'input-types',
    'labels-and-options',
    'multiple-forms',
    'radio-buttons',
    'use-fetcher',
    'use-field',
    'use-form-state',
  ],
  modes: ['on-blur', 'on-change', 'on-submit'],
  'render-field': [
    'dirty-indicator',
    'error-indicator',
    'inline-checkboxes',
    'required-indicator',
  ],
  schemas: [
    'array-of-objects',
    'array-of-strings',
    'booleans',
    'dates',
    'enums',
    'numbers',
    'strings',
    'zod-effects',
  ],
}

const testExamples = [
  'fetcher-with-other-forms-error',
  'field-with-radio-children',
  'field-with-ref',
  'hidden-field-with-errors',
]

export const exampleRoutes = Object.entries(exampleRouteGroups)
  .map(([group, paths]) => paths.map((path) => `/examples/${group}/${path}`))
  .flat()
  .filter((path) => !path.endsWith('async-validation')) // issues when prerendering

export const confRoutes = times(9, (i) => `/conf/${String(i).padStart(2, '0')}`)

export default [
  index('./routes/home.tsx'),
  route('get-started', './routes/get-started.tsx'),
  route('success', './routes/success.tsx'),
  layout('./routes/examples/layout.tsx', [
    route('/examples', './routes/examples/index.ts'),
    ...Object.entries(exampleRouteGroups)
      .map(([group, paths]) =>
        paths.map((path) =>
          route(`examples/${group}/${path}`, `./routes/examples/${path}.tsx`),
        ),
      )
      .flat(),
    ...testExamples.map((path) =>
      route(`/test-examples/${path}`, `./routes/tests/${path}.tsx`),
    ),
  ]),
  layout('./routes/conf/layout.tsx', [
    route('conf', './routes/conf/index.tsx'),
    ...confRoutes.map((path) => route(path, `./routes${path}.tsx`)),
  ]),
  route('conf/success/:referrer', './routes/conf/success.tsx'),
] satisfies RouteConfig
