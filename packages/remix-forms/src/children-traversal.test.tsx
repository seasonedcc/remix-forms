import * as React from 'react'
import { describe, expect, it } from 'vitest'
import {
  findElement,
  findParent,
  mapChildren,
  reduceElements,
} from './children-traversal'

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

describe('findElement and findParent', () => {
  it('locates elements and their parents within a tree', () => {
    const child = (
      <span key="c" id="child">
        C
      </span>
    )
    const tree = (
      <div>
        <section>{[child]}</section>
      </div>
    )

    const found = findElement(tree, (el) => el.props.id === 'child')
    expect(found).toBe(child)

    const parent = findParent(tree, child)
    expect(parent?.type).toBe('section')
  })
})
