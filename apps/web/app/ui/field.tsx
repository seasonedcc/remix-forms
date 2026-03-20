import { cx } from '~/helpers'

export default function Field({
  className,
  ...props
}: JSX.IntrinsicElements['div']) {
  return <div className={cx('flex flex-col gap-2', className)} {...props} />
}
