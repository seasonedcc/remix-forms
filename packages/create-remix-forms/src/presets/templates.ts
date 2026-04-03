import type { ButtonClassMap, SlotDefinition } from '../types'

function renderSlot(def: SlotDefinition, classes: ButtonClassMap): string {
  switch (def.pattern) {
    case 'form':
      return renderForm(def, classes)
    case 'forwardRef-input':
      return renderForwardRefInput(def, classes)
    case 'forwardRef-textarea':
      return renderForwardRefTextarea(def, classes)
    case 'forwardRef-select':
      return renderForwardRefSelect(def, classes)
    case 'forwardRef-div':
      return renderForwardRefDiv(def, classes)
    case 'forwardRef-button':
      return renderForwardRefButton(def, classes)
    case 'function-div':
      return renderFunctionDiv(def, classes)
    case 'function-label':
      return renderFunctionLabel(def, classes)
    case 'function-fieldset':
      return renderFunctionFieldset(def, classes)
    case 'button-wrapped':
      return renderButtonWrapped(def, classes)
  }
}

function renderForm(def: SlotDefinition, classes: ButtonClassMap): string {
  return `import * as React from 'react'
import { Form as ReactRouterForm } from 'react-router'
import { twMerge } from 'tailwind-merge'

const ${def.exportName} = React.forwardRef<
  HTMLFormElement,
  React.ComponentPropsWithRef<typeof ReactRouterForm>
>(({ className, ...props }, ref) => (
  <ReactRouterForm
    ref={ref}
    className={twMerge('${classes[def.slotName]}', className)}
    {...props}
  />
))

export default ${def.exportName}
`
}

function renderForwardRefInput(
  def: SlotDefinition,
  classes: ButtonClassMap
): string {
  const defaultPropsDestructure = def.defaultProps
    ? Object.entries(def.defaultProps)
        .map(([key, value]) => `${key} = ${value}`)
        .join(', ')
    : null

  const destructure = defaultPropsDestructure
    ? `{ ${defaultPropsDestructure}, className, ...props }`
    : '{ className, ...props }'

  const defaultPropsJsx = def.defaultProps
    ? Object.keys(def.defaultProps)
        .map((key) => `\n    ${key}={${key}}`)
        .join('')
    : ''

  return `import * as React from 'react'
import { twMerge } from 'tailwind-merge'

const ${def.exportName} = React.forwardRef<
  HTMLInputElement,
  JSX.IntrinsicElements['input']
>((${destructure}, ref) => (
  <input
    ref={ref}${defaultPropsJsx}
    className={twMerge('${classes[def.slotName]}', className)}
    {...props}
  />
))

export default ${def.exportName}
`
}

function renderForwardRefTextarea(
  def: SlotDefinition,
  classes: ButtonClassMap
): string {
  return `import * as React from 'react'
import { twMerge } from 'tailwind-merge'

const ${def.exportName} = React.forwardRef<
  HTMLTextAreaElement,
  JSX.IntrinsicElements['textarea']
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={twMerge('${classes[def.slotName]}', className)}
    rows={5}
    {...props}
  />
))

export default ${def.exportName}
`
}

function renderForwardRefSelect(
  def: SlotDefinition,
  classes: ButtonClassMap
): string {
  return `import * as React from 'react'
import { twMerge } from 'tailwind-merge'

const ${def.exportName} = React.forwardRef<
  HTMLSelectElement,
  JSX.IntrinsicElements['select']
>(({ className, ...props }, ref) => (
  <select
    ref={ref}
    className={twMerge('${classes[def.slotName]}', className)}
    {...props}
  />
))

export default ${def.exportName}
`
}

function renderForwardRefDiv(
  def: SlotDefinition,
  classes: ButtonClassMap
): string {
  return `import * as React from 'react'
import { twMerge } from 'tailwind-merge'

const ${def.exportName} = React.forwardRef<
  HTMLDivElement,
  JSX.IntrinsicElements['div']
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={twMerge('${classes[def.slotName]}', className)}
    {...props}
  />
))

export default ${def.exportName}
`
}

function renderForwardRefButton(
  def: SlotDefinition,
  classes: ButtonClassMap
): string {
  const defaultPropsDestructure = def.defaultProps
    ? Object.entries(def.defaultProps)
        .map(([key, value]) => `${key} = ${value}`)
        .join(', ')
    : null

  const destructure = defaultPropsDestructure
    ? `{ ${defaultPropsDestructure}, className, ...props }`
    : '{ className, ...props }'

  const defaultPropsJsx = def.defaultProps
    ? Object.keys(def.defaultProps)
        .map((key) => `\n    ${key}={${key}}`)
        .join('')
    : ''

  return `import * as React from 'react'
import { twMerge } from 'tailwind-merge'

const ${def.exportName} = React.forwardRef<
  HTMLButtonElement,
  JSX.IntrinsicElements['button']
>((${destructure}, ref) => (
  <button
    ref={ref}${defaultPropsJsx}
    className={twMerge('${classes[def.slotName]}', className)}
    {...props}
  />
))

export default ${def.exportName}
`
}

function renderFunctionDiv(
  def: SlotDefinition,
  classes: ButtonClassMap
): string {
  return `import { twMerge } from 'tailwind-merge'

export default function ${def.exportName}({
  className,
  ...props
}: JSX.IntrinsicElements['div']) {
  return <div className={twMerge('${classes[def.slotName]}', className)} {...props} />
}
`
}

function renderFunctionLabel(
  def: SlotDefinition,
  classes: ButtonClassMap
): string {
  return `import { twMerge } from 'tailwind-merge'

export default function ${def.exportName}({
  className,
  ...props
}: JSX.IntrinsicElements['label']) {
  return (
    <label className={twMerge('${classes[def.slotName]}', className)} {...props} />
  )
}
`
}

function renderFunctionFieldset(
  def: SlotDefinition,
  classes: ButtonClassMap
): string {
  return `import { twMerge } from 'tailwind-merge'

export default function ${def.exportName}({
  className,
  ...props
}: JSX.IntrinsicElements['fieldset']) {
  return (
    <fieldset
      className={twMerge('${classes[def.slotName]}', className)}
      {...props}
    />
  )
}
`
}

function renderButtonWrapped(
  def: SlotDefinition,
  classes: ButtonClassMap
): string {
  return `import { twMerge } from 'tailwind-merge'

export default function ${def.exportName}({
  className,
  ...props
}: JSX.IntrinsicElements['button']) {
  return (
    <div className="${classes.buttonWrapper}">
      <button
        className={twMerge('${classes[def.slotName]}', className)}
        {...props}
      />
    </div>
  )
}
`
}

export { renderSlot }
