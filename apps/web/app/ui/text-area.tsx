import React from 'react'

const TextArea = React.forwardRef<
  HTMLTextAreaElement,
  JSX.IntrinsicElements['textarea']
>((props, ref) => (
  <textarea
    ref={ref}
    className="shadow-sm focus:ring-pink-500 focus:border-pink-500 block w-full sm:text-sm border-gray-300 rounded-md text-gray-800"
    rows={5}
    {...props}
  />
))

export default TextArea
