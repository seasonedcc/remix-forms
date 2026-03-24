import * as React from 'react'
import { describe, expect, it } from 'vitest'
import { mapChildren, reduceElements } from './children-traversal'

describe('mapChildren', () => {
  it('applies the mapper to all elements recursively', () => {
    const tree = (
      <div>
        <span>A</span>
        <div>
          <p>B</p>
        </div>
      </div>
    )

    const mapped = mapChildren(tree, (child) =>
      React.cloneElement(child, { 'data-mapped': true })
    ) as React.ReactElement[]

    const root = mapped[0]
    expect(root.props['data-mapped']).toBe(true)
    const innerDiv = root.props.children[1]
    expect(innerDiv.props['data-mapped']).toBe(true)
    const innerP = innerDiv.props.children[0]
    expect(innerP.props['data-mapped']).toBe(true)
  })

  it('removes elements when mapper returns null', () => {
    const tree = (
      <div>
        <span>A</span>
        <span>B</span>
      </div>
    )

    const mapped = mapChildren(tree, (child) =>
      child.props.children === 'A' ? null : child
    ) as React.ReactElement[]

    const root = mapped[0]
    expect(root.props.children.length).toBe(1)
    const child = root.props.children[0]
    expect(Array.isArray(child.props.children)).toBe(true)
    expect(child.props.children[0]).toBe('B')
  })
})

describe('reduceElements', () => {
  it('reduces all valid React elements', () => {
    const tree = (
      <div>
        <span>A</span>
        <p>B</p>
      </div>
    )
    const count = reduceElements(tree, 0, (acc) => acc + 1)
    expect(count).toBe(3)
  })

  it('handles fragments when reducing elements', () => {
    const tree = (
      <div>
        <>
          <span>A</span>
          <span>B</span>
        </>
      </div>
    )

    const text = reduceElements(tree, '', (acc, el) =>
      el.type === 'span' ? acc + el.props.children : acc
    )
    expect(text).toBe('AB')
  })
})

describe('additional traversal cases', () => {
  it('does not map function children', () => {
    const FnChild = (_props: { children: () => JSX.Element }) => <section />

    const tree = <FnChild>{() => <span>A</span>}</FnChild>

    const mapped = mapChildren(tree, (child) =>
      React.cloneElement(child, { id: 'mapped' })
    ) as React.ReactElement[]

    const root = mapped[0]
    expect(root.props.id).toBe('mapped')
    expect(typeof root.props.children).toBe('function')
  })

  it('ignores non-elements when reducing', () => {
    const tree = (
      <>
        {'text'}
        <div>B</div>
      </>
    )

    const count = reduceElements(tree, 0, (acc) => acc + 1)
    expect(count).toBe(2)
  })
})
