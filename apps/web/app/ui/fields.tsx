import { cx } from '~/helpers'

export default function Fields({
  className,
  ...props
}: JSX.IntrinsicElements['div']) {
  return <div className={cx('flex flex-col gap-6', className)} {...props} />
}
