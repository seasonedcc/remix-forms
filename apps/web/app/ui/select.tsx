import * as React from 'react'
import { cx } from '~/helpers'

const Select = React.forwardRef<
  HTMLSelectElement,
  JSX.IntrinsicElements['select']
>(({ className, ...props }, ref) => (
  <select
    ref={ref}
    className={cx('select select-bordered w-full', className)}
    {...props}
  />
))

export default Select
