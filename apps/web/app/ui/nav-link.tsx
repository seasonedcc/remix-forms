import { NavLink as RemixNavLink } from '@remix-run/react'
import type { RemixNavLinkProps } from '@remix-run/react/dist/components'
import { cx } from '~/helpers'

export default function NavLink({ className, ...props }: RemixNavLinkProps) {
  return (
    <RemixNavLink
      className={({ isActive }) =>
        cx(
          isActive ? 'text-white' : 'text-gray-100 hover:text-white',
          'block rounded-md px-3 py-2 text-base font-medium',
          typeof className === 'function' ? className({ isActive }) : className,
        )
      }
      {...props}
    />
  )
}
