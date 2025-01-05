import type { NavLinkProps } from 'react-router'
import { NavLink as RemixNavLink } from 'react-router'
import { cx } from '~/helpers'

export default function NavLink({ className, ...props }: NavLinkProps) {
  return (
    <RemixNavLink
      className={({ isActive }) =>
        cx(
          isActive ? 'text-white' : 'text-gray-100 hover:text-white',
          'block rounded-md px-3 py-2 text-base font-medium',
          typeof className === 'function'
            ? className({ isActive, isPending: false, isTransitioning: false })
            : className,
        )
      }
      {...props}
    />
  )
}
