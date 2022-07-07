import { NavLink as RemixNavLink } from '@remix-run/react'
import { cx } from '~/helpers'
import { RemixNavLinkProps } from '@remix-run/react/components'

export default function NavLink({ className, ...props }: RemixNavLinkProps) {
  return (
    <RemixNavLink
      className={({ isActive }) =>
        cx(
          isActive ? 'text-white' : 'text-gray-100 hover:text-white',
          'block px-3 py-2 rounded-md text-base font-medium',
          typeof className === 'function' ? className({ isActive }) : className,
        )
      }
      {...props}
    />
  )
}
