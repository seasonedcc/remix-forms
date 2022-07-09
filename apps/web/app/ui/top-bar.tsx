import { Popover } from '@headlessui/react'
import { MenuIcon, XIcon } from '@heroicons/react/outline'
import { Link, NavLink } from '@remix-run/react'
import { cx } from '~/helpers'
import logo from '~/logo.png'
import ButtonLink from './button-link'
import ExternalLink from './external-link'
import GitHub from './icons/github'
import SecondaryButtonLink from './secondary-button-link'

const navigation = [
  { name: 'Home', to: '/' },
  { name: 'Get Started', to: '/get-started' },
  { name: 'Examples', to: '/examples' },
]

export default function TopBar() {
  return (
    <Popover
      as="nav"
      className="sticky top-0 z-30 bg-gradient-to-r from-black to-gray-800 p-4"
    >
      {({ open, close }) => (
        <>
          <header>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="flex-1">
                <div className="flex shrink-0 items-center">
                  <Link to={'/'} className="block h-10 w-10">
                    <img
                      src={logo}
                      alt="Remix Forms"
                      title="Remix Forms"
                      className="h-10 w-10 drop-shadow-[0_0px_8px_rgba(255,255,0,0.4)]"
                    />
                  </Link>
                </div>
              </div>
              <ButtonLink to={'/get-started'}>Get Started</ButtonLink>
              <SecondaryButtonLink
                to={'/examples'}
                className="hidden sm:inline"
              >
                Examples
              </SecondaryButtonLink>
              <ExternalLink
                href="https://github.com/SeasonedSoftware/remix-forms"
                className="text-white no-underline"
              >
                <GitHub />
              </ExternalLink>
              <div className="flex items-center sm:hidden">
                <Popover.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <MenuIcon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Popover.Button>
              </div>
            </div>
          </header>

          <Popover.Panel className="sm:hidden">
            <div className="space-y-1 px-2 pt-4 pb-2 sm:px-3">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.to}
                  className={({ isActive }) =>
                    cx(
                      isActive
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                      'block rounded-md px-3 py-2 text-base font-medium',
                    )
                  }
                  onClick={() => close()}
                >
                  {item.name}
                </NavLink>
              ))}
            </div>
          </Popover.Panel>
        </>
      )}
    </Popover>
  )
}
