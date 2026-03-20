import type { NavLinkProps } from 'react-router'
import { NavLink as RRNavLink } from 'react-router'
import { cx } from '~/helpers'

export default function NavLink({ className, ...props }: NavLinkProps) {
  return (
    <RRNavLink
      className={({ isActive }) =>
        cx(
          'btn btn-sm w-full justify-start rounded',
          isActive ? 'btn-primary' : 'btn-ghost',
          typeof className === 'function'
            ? className({ isActive, isPending: false, isTransitioning: false })
            : className
        )
      }
      {...props}
    />
  )
}
