import { cx } from '~/helpers'

export default function BaseButton({
  className,
  ...props
}: JSX.IntrinsicElements['button']) {
  return (
    <button
      className={cx(
        'inline-flex items-center justify-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm focus:outline-none ring-2 ring-offset-2 ring-transparent ring-offset-transparent disabled:bg-gray-400',
        className,
      )}
      {...props}
    />
  )
}
