import { cx } from '~/helpers'

export default function SubHeading({
  className,
  ...props
}: JSX.IntrinsicElements['h2']) {
  return (
    <h2
      {...props}
      className={cx(
        'font-medium text-lg text-white leading-6 sm:text-2xl',
        className
      )}
    />
  )
}
