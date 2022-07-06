import React from 'react'
import { cx } from '~/helpers'

const Checkbox = React.forwardRef<
  HTMLInputElement,
  JSX.IntrinsicElements['input']
>(({ type = 'checkbox', className, ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    className={cx(
      'h-4 w-4 rounded',
      className,
      !className && 'border-gray-300 focus:ring-pink-500 text-pink-600',
    )}
    {...props}
  />
))

export default Checkbox
