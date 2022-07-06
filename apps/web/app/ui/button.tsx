import { cx } from '~/helpers'
import BaseButton from './base-button'

export default function Button({
  className,
  ...props
}: JSX.IntrinsicElements['button']) {
  return (
    <BaseButton
      className={cx(
        'text-white bg-pink-600 hover:bg-pink-700 focus:ring-pink-500 focus:ring-offset-white',
        className,
      )}
      {...props}
    />
  )
}
