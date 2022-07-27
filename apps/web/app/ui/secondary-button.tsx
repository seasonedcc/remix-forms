import { cx } from '~/helpers'
import BaseButton from './base-button'

export default function SecondaryButton({
  className,
  ...props
}: JSX.IntrinsicElements['button']) {
  return (
    <BaseButton
      className={cx(
        'border-2 border-gray-200 text-white hover:border-white focus:border-transparent focus:ring-pink-500 focus:ring-offset-white',
        className,
      )}
      {...props}
    />
  )
}
