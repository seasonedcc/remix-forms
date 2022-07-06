import { Link } from '@remix-run/react'
import SecondaryButton from './secondary-button'

export default function SecondaryButtonLink({
  to,
  ...props
}: { to: string } & JSX.IntrinsicElements['button']) {
  return (
    <Link to={to}>
      <SecondaryButton {...props} />
    </Link>
  )
}
