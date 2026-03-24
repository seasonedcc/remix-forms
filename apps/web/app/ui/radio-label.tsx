import { cx } from '~/helpers'

export default function RadioLabel({
  className,
  ...props
}: JSX.IntrinsicElements['label']) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: input is nested at render time
    <label
      className={cx('label flex cursor-pointer items-center gap-2', className)}
      {...props}
    />
  )
}
