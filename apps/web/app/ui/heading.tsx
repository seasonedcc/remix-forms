import { cx } from '~/helpers'

export default function Heading({
  className,
  ...props
}: JSX.IntrinsicElements['h1']) {
  return (
    <h1
      {...props}
      className={cx(
        'font-bold text-2xl text-pink-500 leading-7 sm:text-5xl',
        className
      )}
    />
  )
}
