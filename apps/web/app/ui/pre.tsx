import { cx } from '~/helpers'

export default function Pre({
  className,
  ...props
}: JSX.IntrinsicElements['pre']) {
  return (
    <pre
      {...props}
      className={cx(
        'max-w-[calc(100vw-2rem)] overflow-auto rounded bg-base-300 p-2 font-mono text-xs sm:text-sm',
        className
      )}
    />
  )
}
