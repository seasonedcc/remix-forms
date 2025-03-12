import * as React from 'react'
import { useNavigation } from 'react-router'
import { P, match } from 'ts-pattern'
import { cx } from '~/helpers'

function GlobalLoading() {
  const navigation = useNavigation()
  const active = navigation.state !== 'idle'

  const ref = React.useRef<HTMLDivElement>(null)
  const [animating, setAnimating] = React.useState(false)

  React.useEffect(() => {
    if (!ref.current) return
    if (active) setAnimating(true)

    Promise.allSettled(
      ref.current.getAnimations().map(({ finished }) => finished)
    ).then(() => !active && setAnimating(false))
  }, [active])

  return (
    <div
      aria-hidden={!active}
      aria-valuetext={active ? 'Loading' : undefined}
      className="fixed inset-x-0 top-0 left-0 z-50 h-1 animate-pulse"
    >
      <div
        ref={ref}
        className={cx(
          'h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500 ease-in-out',
          match([navigation.state, animating])
            .with(['idle', false], () => 'w-0 opacity-0 transition-none')
            .with(['submitting', P._], () => 'w-5/12')
            .with(['loading', P._], () => 'w-10/12')
            .otherwise(() => 'w-full')
        )}
      />
    </div>
  )
}

export { GlobalLoading }
