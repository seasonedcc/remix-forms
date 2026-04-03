import * as React from 'react'

const ArrayTitle = React.forwardRef<
  HTMLDivElement,
  JSX.IntrinsicElements['div']
>((props, ref) => <div ref={ref} className="label" {...props} />)

export default ArrayTitle
