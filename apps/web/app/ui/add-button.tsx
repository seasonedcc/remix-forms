import * as React from 'react'

const AddButton = React.forwardRef<
  HTMLButtonElement,
  JSX.IntrinsicElements['button']
>((props, ref) => (
  <button
    ref={ref}
    type="button"
    className="btn btn-outline btn-sm mt-2 self-start"
    {...props}
  />
))

export default AddButton
