import { cx } from '~/helpers'

export default function Heading({
  className,
  ...props
}: JSX.IntrinsicElements['h1']) {
  return (
    <h1
      {...props}
      className={cx(
        'text-2xl font-bold leading-7 text-pink-500 sm:text-5xl',
        className,
      )}
    />
  )
}
