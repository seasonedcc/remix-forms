import * as React from 'react'
import { cx } from '~/helpers'

const TextArea = React.forwardRef<
  HTMLTextAreaElement,
  JSX.IntrinsicElements['textarea']
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cx('textarea textarea-bordered w-full', className)}
    rows={5}
    {...props}
  />
))

export default TextArea
