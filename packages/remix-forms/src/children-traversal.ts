import * as React from 'react'

function mapChildren(
  children: React.ReactNode,
  fn: (child: React.ReactElement) => React.ReactElement | null,
): React.ReactNode {
  return React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) return child
    const mapped = fn(child)
    if (child.props.children && typeof child.props.children !== 'function') {
      const mappedChildren = mapChildren(child.props.children, fn)
      return mapped && React.cloneElement(mapped, { children: mappedChildren })
    }
    return mapped
  })
}

function findElement(
  root: React.ReactNode,
  predicate: (element: React.ReactElement) => boolean,
): React.ReactElement | null {
  const initialState: React.ReactElement | null = null

  return reduceElements<React.ReactElement | null>(
    root,
    initialState,
    (previous, current) => {
      if (previous) return previous

      if (predicate(current)) {
        return current
      }
      return null
    },
  )
}

function findParent(
  root: React.ReactNode,
  child: React.ReactElement,
): React.ReactElement | null {
  return findElement(root, (parentCandidate) => {
    const me = parentCandidate.props?.children?.find?.(
      (ch: React.ReactNode) => {
        return ch === child
      },
    )

    return !!me
  })
}

function reduceElements<T>(
  children: React.ReactNode,
  initialState: T,
  reducer: (previousState: T, currentState: React.ReactElement) => T,
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

export { mapChildren, reduceElements, findElement, findParent }
