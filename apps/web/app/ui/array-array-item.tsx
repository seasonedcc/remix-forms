import * as React from 'react'

const ArrayArrayItem = React.forwardRef<
  HTMLDivElement,
  JSX.IntrinsicElements['div']
>((props, ref) => <div ref={ref} className="flex flex-col gap-2" {...props} />)

export default ArrayArrayItem
