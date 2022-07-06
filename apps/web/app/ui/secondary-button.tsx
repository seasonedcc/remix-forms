import { cx } from '~/helpers'
import BaseButton from './base-button'

export default function SecondaryButton({
  className,
  ...props
}: JSX.IntrinsicElements['button']) {
  return (
    <BaseButton
      className={cx(
        'text-white border-2 border-gray-200 hover:border-white focus:ring-pink-500 focus:border-transparent focus:ring-offset-white',
        className,
      )}
      {...props}
    />
  )
}
