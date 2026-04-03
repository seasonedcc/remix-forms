import * as React from 'react'

const ScalarArrayField = React.forwardRef<
  HTMLDivElement,
  JSX.IntrinsicElements['div']
>((props, ref) => (
  <div ref={ref} className="flex flex-1 flex-col gap-2" {...props} />
))

export default ScalarArrayField
