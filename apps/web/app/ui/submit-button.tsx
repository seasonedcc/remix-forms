import { cx } from '~/helpers'

export default function SubmitButton({
  className,
  ...props
}: JSX.IntrinsicElements['button']) {
  return (
    <div className="flex justify-end">
      <button className={cx('btn btn-primary', className)} {...props} />
    </div>
  )
}
