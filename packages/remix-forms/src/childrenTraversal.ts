import * as React from 'react'

function mapChildren(
  children: React.ReactNode,
  fn: (child: React.ReactElement) => React.ReactElement | null,
): React.ReactNode {
  return React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) return child
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

function reduceElements<T>(
  children: React.ReactNode,
  initialState: T,
  reducer: (
    previousState: T,
    currentState: React.ReactElement,
  ) => T,
): T {
  let foldedValue = initialState
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return

    foldedValue = reducer(foldedValue, child)
    if (child.props.children && typeof child.props.children !== 'function') {
      foldedValue = reduceElements(child.props.children, foldedValue, reducer)
    }

  })
  return foldedValue
}

export { mapChildren, reduceElements }
