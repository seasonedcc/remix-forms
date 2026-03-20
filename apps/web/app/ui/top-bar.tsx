import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Menu } from 'lucide-react'
import { Link } from 'react-router'
import ExternalLink from './external-link'
import GitHub from './icons/github'

const navigation = [
  { name: 'Home', to: '/' },
  { name: 'Get started', to: '/get-started' },
  { name: 'Examples', to: '/examples' },
]

export default function TopBar() {
  return (
    <nav className="navbar fixed top-0 z-50 border-white/5 border-b bg-base-100/60 px-4 backdrop-blur-xl">
      <div className="navbar-start">
        <Link
          to="/"
          className="font-bold font-display text-lg tracking-tighter"
        >
          <span className="bg-linear-to-r from-[#c0392b] via-[#ff7979] to-[#e74c3c] bg-clip-text text-transparent">
            Remix Forms
          </span>
        </Link>
      </div>
      <div className="navbar-end gap-2 sm:gap-4">
        <Link
          to="/get-started"
          className="btn btn-primary btn-sm border-0 bg-linear-to-r from-[#c0392b] via-[#e04848] to-[#e74c3c]"
        >
          Get started
        </Link>
        <Link
          to="/examples"
          className="btn btn-ghost btn-sm hidden sm:inline-flex"
        >
          Examples
        </Link>
        <ExternalLink
          href="https://github.com/seasonedcc/remix-forms"
          className="hidden text-base-content/50 no-underline transition-colors hover:text-base-content sm:block"
        >
          <GitHub className="size-5" />
        </ExternalLink>
        <div className="flex sm:hidden">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button type="button" className="btn btn-ghost btn-square btn-sm">
                <span className="sr-only">Open main menu</span>
                <Menu className="block size-5" aria-hidden="true" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                side="bottom"
                sideOffset={5}
                className="z-50 mr-2 flex flex-col gap-3 rounded-xl border border-white/10 bg-base-200/95 p-4 backdrop-blur-xl"
              >
                {navigation.map((item) => (
                  <DropdownMenu.Item key={item.name} asChild>
                    <Link to={item.to}>{item.name}</Link>
                  </DropdownMenu.Item>
                ))}
                <DropdownMenu.Separator className="h-px bg-white/10" />
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
