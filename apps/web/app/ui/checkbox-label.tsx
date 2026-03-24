import { cx } from '~/helpers'

export default function CheckboxLabel({
  className,
  ...props
}: JSX.IntrinsicElements['label']) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: association happens at render time via htmlFor
    <label className={cx('label', className)} {...props} />
  )
}
