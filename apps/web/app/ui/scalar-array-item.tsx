import * as React from 'react'

const ScalarArrayItem = React.forwardRef<
  HTMLDivElement,
  JSX.IntrinsicElements['div']
>((props, ref) => (
  <div ref={ref} className="flex items-center gap-2" {...props} />
))

export default ScalarArrayItem
