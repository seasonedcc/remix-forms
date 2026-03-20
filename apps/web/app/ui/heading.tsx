import { cx } from '~/helpers'

export default function Heading({
  className,
  ...props
}: JSX.IntrinsicElements['h1']) {
  return (
    <h1
      {...props}
      className={cx(
        'font-bold text-2xl text-primary leading-7 tracking-tight sm:text-5xl sm:leading-none',
        className
      )}
    />
  )
}
