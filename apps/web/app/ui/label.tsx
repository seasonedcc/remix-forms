import { cx } from '~/helpers'

export default function Label({
  className,
  ...props
}: JSX.IntrinsicElements['label']) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: <explanation>
    <label className={cx('label', className)} {...props} />
  )
}
