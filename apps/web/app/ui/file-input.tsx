import * as React from 'react'
import { cx } from '~/helpers'

const FileInput = React.forwardRef<
  HTMLInputElement,
  JSX.IntrinsicElements['input']
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cx('file-input file-input-bordered w-full', className)}
    {...props}
  />
))

export default FileInput
