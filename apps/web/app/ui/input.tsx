import * as React from 'react'
import { cx } from '~/helpers'

const Input = React.forwardRef<
  HTMLInputElement,
  JSX.IntrinsicElements['input']
>(({ type = 'text', className, ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    className={cx(
      'block w-full rounded-md text-gray-800 shadow-sm sm:text-sm',
      className,
      !className && 'border-gray-300 focus:border-pink-500 focus:ring-pink-500'
    )}
    {...props}
  />
))

export default Input
