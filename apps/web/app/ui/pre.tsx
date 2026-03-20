import { cx } from '~/helpers'

export default function Pre({
  className,
  ...props
}: JSX.IntrinsicElements['pre']) {
  return (
    <pre
      {...props}
      className={cx(
        'max-w-[calc(100vw-2rem)] overflow-auto rounded-2xl border border-white/10 bg-white/5 p-4 font-mono text-xs sm:text-sm',
        className
      )}
    />
  )
}
