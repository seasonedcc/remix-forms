import {
  index,
  layout,
  prefix,
  route,
  RouteConfig,
} from '@react-router/dev/routes'

export default [
  index('./routes/home.tsx'),
  route('get-started', './routes/get-started.tsx'),
  route('success', './routes/success.tsx'),
  layout('./routes/examples/layout.tsx', [
    ...prefix('examples', [
      index('./routes/examples/index.ts'),
      ...prefix('actions', [
        route('context', './routes/examples/context.tsx'),
        route('redirect', './routes/examples/redirect.tsx'),
        route('custom-response', './routes/examples/custom-response.tsx'),
        route('field-error', './routes/examples/field-error.tsx'),
        route('global-error', './routes/examples/global-error.tsx'),
        route('transform-values', './routes/examples/transform-values.tsx'),
        route('without-redirect', './routes/examples/without-redirect.tsx'),
      ]),
      ...prefix('forms', [
        route('async-validation', './routes/examples/async-validation.tsx'),
        route('auto-generated', './routes/examples/auto-generated.tsx'),
        route('custom-input', './routes/examples/custom-input.tsx'),
        route('dynamic-form', './routes/examples/dynamic-form.tsx'),
        route('edit-values', './routes/examples/edit-values.tsx'),
        route('field-layout', './routes/examples/field-layout.tsx'),
        route(
          'field-with-children',
          './routes/examples/field-with-children.tsx',
        ),
        route('form-with-children', './routes/examples/form-with-children.tsx'),
        route('hidden-field', './routes/examples/hidden-field.tsx'),
        route('imperative-submit', './routes/examples/imperative-submit.tsx'),
        route('input-types', './routes/examples/input-types.tsx'),
        route('labels-and-options', './routes/examples/labels-and-options.tsx'),
        route('multiple-forms', './routes/examples/multiple-forms.tsx'),
        route('radio-buttons', './routes/examples/radio-buttons.tsx'),
        route('use-fetcher', './routes/examples/use-fetcher.tsx'),
        route('use-field', './routes/examples/use-field.tsx'),
        route('use-form-state', './routes/examples/use-form-state.tsx'),
      ]),
      ...prefix('modes', [
        route('on-blur', './routes/examples/on-blur.tsx'),
        route('on-change', './routes/examples/on-change.tsx'),
        route('on-submit', './routes/examples/on-submit.tsx'),
      ]),
      ...prefix('render-field', [
        route('dirty-indicator', './routes/examples/dirty-indicator.tsx'),
        route('error-indicator', './routes/examples/error-indicator.tsx'),
        route('inline-checkboxes', './routes/examples/inline-checkboxes.tsx'),
        route('required-indicator', './routes/examples/required-indicator.tsx'),
      ]),
      ...prefix('schemas', [
        route('array-of-objects', './routes/examples/array-of-objects.tsx'),
        route('array-of-strings', './routes/examples/array-of-strings.tsx'),
        route('booleans', './routes/examples/booleans.tsx'),
        route('dates', './routes/examples/dates.tsx'),
        route('enums', './routes/examples/enums.tsx'),
        route('numbers', './routes/examples/numbers.tsx'),
        route('strings', './routes/examples/strings.tsx'),
        route('zod-effects', './routes/examples/zod-effects.tsx'),
      ]),
    ]),
    ...prefix('test-examples', [
      route(
        'fetcher-with-other-forms-error',
        './routes/tests/fetcher-with-other-forms-error.tsx',
      ),
      route(
        'field-with-radio-children',
        './routes/tests/field-with-radio-children.tsx',
      ),
      route('field-with-ref', './routes/tests/field-with-ref.tsx'),
      route(
        'hidden-field-with-errors',
        './routes/tests/hidden-field-with-errors.tsx',
      ),
    ]),
  ]),
  layout('./routes/conf/layout.tsx', [
    ...prefix('conf', [
      index('./routes/conf/index.tsx'),
      ...Array.from({ length: 9 }, (_, i) => {
        const num = String(i + 1).padStart(2, '0')
        return route(num, `./routes/conf/${num}.tsx`)
      }),
    ]),
  ]),
  route('conf/success/:referrer', './routes/conf/success.tsx'),
] satisfies RouteConfig
