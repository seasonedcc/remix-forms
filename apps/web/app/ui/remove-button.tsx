import * as React from 'react'

const RemoveButton = React.forwardRef<
  HTMLButtonElement,
  JSX.IntrinsicElements['button']
>((props, ref) => (
  <button
    ref={ref}
    type="button"
    className="btn btn-ghost btn-sm text-error"
    {...props}
  />
))

export default RemoveButton
