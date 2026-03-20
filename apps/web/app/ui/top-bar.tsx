import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Menu } from 'lucide-react'
import { Link } from 'react-router'
import logo from '~/logo.png'
import ExternalLink from './external-link'
import GitHub from './icons/github'

const navigation = [
  { name: 'Home', to: '/' },
  { name: 'Get Started', to: '/get-started' },
  { name: 'Examples', to: '/examples' },
]

export default function TopBar() {
  return (
    <nav className="navbar sticky top-0 bg-base-100 p-4">
      <div className="navbar-start">
        <Link to="/" className="block size-10">
          <img
            src={logo}
            alt="Remix Forms"
            title="Remix Forms"
            className="size-10"
          />
        </Link>
      </div>
      <div className="navbar-end gap-2 sm:gap-4">
        <Link to="/get-started" className="btn btn-primary">
          Get Started
        </Link>
        <Link to="/examples" className="btn btn-outline hidden sm:inline-flex">
          Examples
        </Link>
        <ExternalLink
          href="https://github.com/seasonedcc/remix-forms"
          className="no-underline"
        >
          <GitHub />
        </ExternalLink>
        <div className="flex sm:hidden">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button type="button" className="btn btn-ghost btn-square">
                <span className="sr-only">Open main menu</span>
                <Menu className="block size-6" aria-hidden="true" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                side="bottom"
                sideOffset={5}
                className="mr-2 flex flex-col gap-3 rounded bg-base-300 p-4"
              >
                {navigation.map((item) => (
                  <DropdownMenu.Item key={item.name} asChild>
                    <Link to={item.to}>{item.name}</Link>
                  </DropdownMenu.Item>
                ))}
                <DropdownMenu.Separator className="h-px bg-base-content/30" />
                <DropdownMenu.Item asChild>
                  <a
                    href="https://github.com/seasonedcc/remix-forms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 no-underline"
                  >
                    <GitHub className="size-4" />
                    GitHub
                  </a>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>
    </nav>
  )
}
