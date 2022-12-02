import * as React from 'react'

function mapChildren(
  children: React.ReactNode,
  fn: (child: React.ReactNode, parent?: React.ReactNode) => React.ReactNode,
  parent?: React.ReactNode,
): React.ReactNode {
  return React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) return fn(child)
    if (child.props.children && typeof child.props.children !== 'function') {
      return fn(
        React.cloneElement(child, {
          ...child.props,
          children: mapChildren(child.props.children, fn, child),
        }),
        parent,
      )
    }
    return fn(child, parent)
  })
}

function reduceElements<T>(
  children: React.ReactNode,
  initialState: T,
  reducer: (
    previousState: T,
    currentState: React.ReactElement | React.ReactPortal,
  ) => T,
): T {
  let foldedValue = initialState
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return

    if (child.props.children && typeof child.props.children !== 'function') {
      foldedValue = reduceElements(child.props.children, foldedValue, reducer)
      return
    }

    foldedValue = reducer(foldedValue, child)
  })
  return foldedValue
}

export { mapChildren, reduceElements }
