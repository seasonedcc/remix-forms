import * as React from 'react'
import { cx } from '~/helpers'

const Radio = React.forwardRef<
  HTMLInputElement,
  JSX.IntrinsicElements['input']
>(({ type = 'radio', className, ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    className={cx('radio radio-primary', className)}
    {...props}
  />
))

export default Radio
