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
