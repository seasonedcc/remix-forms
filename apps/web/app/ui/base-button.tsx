import { cx } from '~/helpers'

export default function BaseButton({
  className,
  ...props
}: JSX.IntrinsicElements['button']) {
  return (
    <button
      className={cx(
        'inline-flex items-center justify-center gap-1 rounded-md border px-6 py-2 font-medium text-base shadow-sm ring-2 ring-transparent ring-offset-2 ring-offset-transparent focus:outline-none disabled:bg-gray-400',
        className
      )}
      {...props}
    />
  )
}
