import { describe, expect, it, vi } from 'vitest'

vi.mock('react-router', () => {
  return {
    Form: (props: React.FormHTMLAttributes<HTMLFormElement>) => (
      <form {...props} />
    ),
    useActionData: vi.fn(() => undefined),
    useNavigation: vi.fn(() => ({ state: 'idle' })),
    useSubmit: () => () => {},
  }
})

import type * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import * as z from 'zod/v4'
import { SchemaForm } from './schema-form'

describe('SchemaForm hidden field errors', () => {
  it('promotes hidden field errors to global errors', () => {
    const schema = z.object({ visible: z.string(), secret: z.string() })
    const html = renderToStaticMarkup(
      <SchemaForm
        schema={schema}
        hiddenFields={['secret']}
        labels={{ secret: 'Secret' }}
        errors={{ secret: ['Missing'] }}
      />
    )

    expect(html).toContain('role="alert"')
    expect(html).toContain('Secret: Missing')
  })
})
