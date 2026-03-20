import { cx } from '~/helpers'

export default function SubHeading({
  className,
  ...props
}: JSX.IntrinsicElements['h2']) {
  return (
    <h2
      {...props}
      className={cx(
        'font-medium text-base-content text-lg leading-6 sm:text-2xl sm:leading-snug',
        className
      )}
    />
  )
}
