import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { FieldsSentinel, expandFieldsSentinel } from './fields-sentinel'

function Field({ name, label }: { name: string; label?: string }) {
  return <div data-field={name}>{label ?? name}</div>
}

function FieldsWrapper({ children }: { children?: React.ReactNode }) {
  return <section data-fields>{children}</section>
}

const defaultOptions = {
  sentinelType: FieldsSentinel,
  fieldIdentity: Field,
  schemaKeys: ['first', 'second', 'third'],
  FieldsWrapper,
}

function renderExpanded(tree: React.ReactNode): string {
  const result = expandFieldsSentinel(tree, defaultOptions)
  return renderToStaticMarkup(React.createElement('div', null, result))
}

describe('expandFieldsSentinel', () => {
  it('returns tree unchanged when there is no sentinel', () => {
    const html = renderExpanded(
      <div>
        <Field name="first" />
      </div>
    )

    expect(html).toContain('data-field="first"')
    expect(html).not.toContain('data-fields')
  })

  it('replaces sentinel with wrapper containing all schema fields', () => {
    const html = renderExpanded(<FieldsSentinel />)

    expect(html).toContain('data-fields')
    expect(html).toContain('data-field="first"')
    expect(html).toContain('data-field="second"')
    expect(html).toContain('data-field="third"')
  })

  it('uses override Field elements for matching keys', () => {
    const html = renderExpanded(
      <FieldsSentinel>
        <Field name="second" label="Custom Second" />
      </FieldsSentinel>
    )

    expect(html).toContain('data-field="first"')
    expect(html).toContain('Custom Second')
    expect(html).toContain('data-field="third"')
  })

  it('preserves schema order when overrides are out of order', () => {
    const html = renderExpanded(
      <FieldsSentinel>
        <Field name="third" label="C" />
        <Field name="first" label="A" />
      </FieldsSentinel>
    )

    const firstIdx = html.indexOf('data-field="first"')
    const secondIdx = html.indexOf('data-field="second"')
    const thirdIdx = html.indexOf('data-field="third"')

    expect(firstIdx).toBeLessThan(secondIdx)
    expect(secondIdx).toBeLessThan(thirdIdx)
  })

  it('ignores non-Field children inside sentinel', () => {
    const html = renderExpanded(
      <FieldsSentinel>
        <div>stray element</div>
        <Field name="second" label="Override" />
        <span>another stray</span>
      </FieldsSentinel>
    )

    expect(html).not.toContain('stray element')
    expect(html).not.toContain('another stray')
    expect(html).toContain('data-field="first"')
    expect(html).toContain('Override')
    expect(html).toContain('data-field="third"')
  })

  it('expands sentinel nested inside other elements', () => {
    const html = renderExpanded(
      <div className="wrapper">
        <FieldsSentinel>
          <Field name="first" label="Custom" />
        </FieldsSentinel>
      </div>
    )

    expect(html).toContain('class="wrapper"')
    expect(html).toContain('data-fields')
    expect(html).toContain('Custom')
    expect(html).toContain('data-field="second"')
    expect(html).toContain('data-field="third"')
  })
})
