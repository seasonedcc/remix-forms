import * as React from 'react'

const ObjectFields = React.forwardRef<
  HTMLDivElement,
  JSX.IntrinsicElements['div']
>((props, ref) => (
  <div
    ref={ref}
    className="flex flex-col gap-4 border-base-100 border-l-2 pl-4"
    {...props}
  />
))

export default ObjectFields
