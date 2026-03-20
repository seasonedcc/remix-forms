import * as Collapsible from '@radix-ui/react-collapsible'
import { ChevronDown, X } from 'lucide-react'
import { type ReactNode, useEffect, useState } from 'react'
import { type NavLinkProps, useLocation } from 'react-router'
import { cx } from '~/helpers'
import UINavLink from '~/ui/nav-link'

function Nav({
  children,
  menuTitle = 'More examples',
}: {
  children: ReactNode
  menuTitle?: string
}) {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setOpen(false)
  }, [location])

  return (
    <Collapsible.Root open={open} onOpenChange={setOpen} asChild>
      <nav className="relative">
        <Collapsible.Trigger asChild>
          <div className="flex w-full px-4 md:hidden">
            {open ? (
              <button className="btn btn-ghost absolute top-1 right-1">
                <X className="block h-6 w-6" aria-hidden="true" />
              </button>
            ) : (
              <button className="btn btn-outline mt-2 flex-1">
                <span>{menuTitle}</span>
                <ChevronDown className="size-6" aria-hidden="true" />
              </button>
            )}
          </div>
        </Collapsible.Trigger>
        <Collapsible.Content asChild>
          <div className="block rounded bg-primary p-2 md:hidden">
            <ul className="menu text-primary-content">{children}</ul>
          </div>
        </Collapsible.Content>
        <div className="hidden min-h-full w-[14rem] bg-primary p-2 md:block">
          <ul className="menu text-primary-content">{children}</ul>
        </div>
      </nav>
    </Collapsible.Root>
  )
}

function NavTitle({ children }: { children: ReactNode }) {
  return <li className="menu-title">{children}</li>
}

function NavLink({ className, ...props }: NavLinkProps) {
  return (
    <li>
      <UINavLink
        className={({ isActive, isPending, isTransitioning }) =>
          cx(
            isActive ? 'active' : '',
            typeof className === 'function'
              ? className({ isActive, isPending, isTransitioning })
              : className
          )
        }
        {...props}
      />
    </li>
  )
}

function Content({ children }: { children: ReactNode }) {
  return <div className="flex-1">{children}</div>
}

function SidebarRoot({ children }: { children: ReactNode }) {
  return <div className="flex flex-col p-2 md:flex-row md:p-0">{children}</div>
}

const SidebarLayout = Object.assign(SidebarRoot, {
  Nav,
  NavTitle,
  NavLink,
  Content,
})

export { SidebarLayout }
