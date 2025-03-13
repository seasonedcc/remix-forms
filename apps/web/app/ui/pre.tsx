import { cx } from '~/helpers'

export default function Pre({
  className,
  ...props
}: JSX.IntrinsicElements['pre']) {
  return (
    <pre
      {...props}
      className={cx(
        'scrollbar-thin scrollbar-track-gray-600 scrollbar-thumb-gray-800 max-w-[calc(100vw-2rem)] overflow-auto rounded bg-black p-2 font-mono text-white text-xs sm:text-sm',
        className
      )}
    />
  )
}
