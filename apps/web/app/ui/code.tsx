import { cx } from '~/helpers'
import Pre from './pre'

export default function Code({
  className,
  children,
  ...props
}: { children: string } & JSX.IntrinsicElements['pre']) {
  return (
    <Pre
      {...props}
      className={cx(
        'max-h-[60vh] max-w-[calc(100vw-2rem)] xl:flex-1',
        className,
      )}
      dangerouslySetInnerHTML={{ __html: children }}
    />
  )
}
