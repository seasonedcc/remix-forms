import * as React from 'react'
import { cx } from '~/helpers'

const Input = React.forwardRef<
  HTMLInputElement,
  JSX.IntrinsicElements['input']
>(({ type = 'text', className, ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    className={cx('input input-bordered w-full', className)}
    {...props}
  />
))

export default Input
