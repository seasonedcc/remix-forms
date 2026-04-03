import * as React from 'react'

const ArrayEmpty = React.forwardRef<
  HTMLDivElement,
  JSX.IntrinsicElements['div']
>((props, ref) => (
  <div ref={ref} className="py-2 text-base-content/50 text-sm" {...props} />
))

export default ArrayEmpty
