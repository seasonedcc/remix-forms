import { cx } from '~/helpers'

export default function Label({
  className,
  ...props
}: JSX.IntrinsicElements['label']) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: <explanation>
    <label
      className={cx(
        'mb-2 block font-medium',
        className,
        !className && 'text-gray-400'
      )}
      {...props}
    />
  )
}
