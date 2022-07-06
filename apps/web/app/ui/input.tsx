import React from 'react'
import { cx } from '~/helpers'

const Input = React.forwardRef<
  HTMLInputElement,
  JSX.IntrinsicElements['input']
>(({ type = 'text', className, ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    className={cx(
      'shadow-sm block w-full sm:text-sm rounded-md text-gray-800',
      className,
      !className && 'border-gray-300 focus:ring-pink-500 focus:border-pink-500',
    )}
    {...props}
  />
))

export default Input
