import * as React from 'react'

type FieldsSentinelProps = {
  children?: React.ReactNode
  [key: string]: unknown
}

/**
 * Sentinel component used as an identity marker for the `Fields` helper.
 *
 * This component is never rendered to the DOM. During preprocessing,
 * {@link expandFieldsSentinel} replaces every `<FieldsSentinel>` node with a
 * `FieldsWrapper` element containing the correct `Field` elements in schema
 * order.
 */
function FieldsSentinel(
  _props: FieldsSentinelProps
): React.ReactElement | null {
  return null
}

type ExpandOptions = {
  sentinelType: React.ComponentType
  // biome-ignore lint/suspicious/noExplicitAny: Field component props vary per schema — used for identity check and createElement
  fieldIdentity: React.ComponentType<any>
  schemaKeys: string[]
  // biome-ignore lint/suspicious/noExplicitAny: wrapper component props vary per user-provided component
  FieldsWrapper: React.ComponentType<any>
}

/**
 * Pre-process a React tree, replacing every `<FieldsSentinel>` node with a
 * `<FieldsWrapper>` that contains one `Field` element per schema key.
 *
 * Direct `Field` children of the sentinel are treated as overrides — they
 * replace the default bare `<Field>` for that key. All other children of the
 * sentinel are discarded.
 *
 * @returns A new tree with sentinel nodes expanded.
 */
function expandFieldsSentinel(
  node: React.ReactNode,
  options: ExpandOptions
): React.ReactNode {
  const { sentinelType, fieldIdentity, schemaKeys, FieldsWrapper } = options

  return React.Children.map(node, (child) => {
    if (!React.isValidElement(child)) return child

    if (child.type === sentinelType) {
      const overrides = new Map<string, React.ReactElement>()
      React.Children.forEach(
        (child.props as FieldsSentinelProps).children,
        (overrideChild) => {
          if (React.isValidElement(overrideChild)) {
            const props = overrideChild.props as { name?: string }
            if (overrideChild.type === fieldIdentity && props.name) {
              overrides.set(String(props.name), overrideChild)
            }
          }
        }
      )

      const fieldElements = schemaKeys.map((key) => {
        const override = overrides.get(key)
        if (override) return override
        return React.createElement(fieldIdentity, { key, name: key })
      })

      const { children: _c, ...wrapperProps } =
        child.props as FieldsSentinelProps
      return React.createElement(FieldsWrapper, wrapperProps, ...fieldElements)
    }

    const childProps = child.props as { children?: React.ReactNode }
    if (childProps.children && typeof childProps.children !== 'function') {
      const newChildren = expandFieldsSentinel(childProps.children, options)
      return React.cloneElement(child, {
        children: newChildren,
      } as React.Attributes & { children: React.ReactNode })
    }

    return child
  })
}

export type { FieldsSentinelProps }
export { FieldsSentinel, expandFieldsSentinel }
