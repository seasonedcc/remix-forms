import { cx } from '~/helpers'

export default function SubHeading({
  className,
  ...props
}: JSX.IntrinsicElements['h2']) {
  return (
    <h2
      {...props}
      className={cx(
        'text-lg font-medium leading-6 text-white sm:text-2xl',
        className,
      )}
    />
  )
}
