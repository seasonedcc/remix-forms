import { cx } from '~/helpers'

export default function Label({
  className,
  ...props
}: JSX.IntrinsicElements['label']) {
  return (
    <label
      className={cx(
        'block font-medium',
        className,
        !className && 'text-gray-400',
      )}
      {...props}
    />
  )
}
