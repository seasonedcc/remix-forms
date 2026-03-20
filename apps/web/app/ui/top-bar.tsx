import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import * as Collapsible from '@radix-ui/react-collapsible'
import { useState } from 'react'
import { Link, NavLink } from 'react-router'
import { cx } from '~/helpers'
import logo from '~/logo.png'
import ExternalLink from './external-link'
import GitHub from './icons/github'

const navigation = [
  { name: 'Home', to: '/' },
  { name: 'Get Started', to: '/get-started' },
  { name: 'Examples', to: '/examples' },
]

export default function TopBar() {
  const [open, setOpen] = useState(false)

  return (
    <Collapsible.Root open={open} onOpenChange={setOpen} asChild>
      <nav className="navbar sticky top-0 z-30 bg-base-100 p-4">
        <div className="navbar-start">
          <Link to={'/'} className="block h-10 w-10">
            <img
              src={logo}
              alt="Remix Forms"
              title="Remix Forms"
              className="h-10 w-10"
            />
          </Link>
        </div>
        <div className="navbar-end gap-2 sm:gap-4">
          <Link to="/get-started" className="btn btn-primary">
            Get Started
          </Link>
          <Link
            to="/examples"
            className="btn btn-outline hidden sm:inline-flex"
          >
            Examples
          </Link>
          <ExternalLink
            href="https://github.com/seasonedcc/remix-forms"
            className="no-underline"
          >
            <GitHub />
          </ExternalLink>
          <div className="flex items-center sm:hidden">
            <Collapsible.Trigger asChild>
              <button className="btn btn-ghost btn-square">
                {open ? (
                  <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </Collapsible.Trigger>
          </div>
        </div>
        <Collapsible.Content asChild>
          <div className="gap-1 px-2 pt-4 pb-2 sm:px-3">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.to}
                className={({ isActive }) =>
                  cx(
                    isActive
                      ? 'bg-primary text-primary-content'
                      : 'hover:bg-base-200',
                    'block rounded-md px-3 py-2 font-medium text-base'
                  )
                }
                onClick={() => setOpen(false)}
              >
                {item.name}
              </NavLink>
            ))}
          </div>
        </Collapsible.Content>
      </nav>
    </Collapsible.Root>
  )
}
