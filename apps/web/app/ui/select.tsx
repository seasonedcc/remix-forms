import React from 'react'
import { cx } from '~/helpers'

const Select = React.forwardRef<
  HTMLSelectElement,
  JSX.IntrinsicElements['select']
>(({ className, ...props }, ref) => (
  <select
    ref={ref}
    className={cx(
      'block w-full pl-3 pr-10 py-2 text-base focus:outline-none sm:text-sm rounded-md text-gray-800',
      className,
      !className && 'border-gray-300 focus:ring-pink-500 focus:border-pink-500',
    )}
    {...props}
  />
))

export default Select
