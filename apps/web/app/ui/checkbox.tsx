import * as React from 'react'
import { cx } from '~/helpers'

const Checkbox = React.forwardRef<
  HTMLInputElement,
  JSX.IntrinsicElements['input']
>(({ type = 'checkbox', className, ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    className={cx('checkbox checkbox-primary', className)}
    {...props}
  />
))

export default Checkbox
