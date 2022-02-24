import React from 'react'

export default function mapChildren(
  children: React.ReactNode,
  fn: (child: React.ReactNode) => React.ReactNode,
): React.ReactNode {
  return React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) return fn(child)

    if (child.props.children && typeof child.props.children !== 'function') {
      return fn(
        React.cloneElement(child, {
          ...child.props,
          children: mapChildren(child.props.children, fn),
        }),
      )
    }

    return fn(child)
  })
}
