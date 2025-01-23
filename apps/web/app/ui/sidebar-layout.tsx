import { ChevronDownIcon, XMarkIcon } from '@heroicons/react/24/outline'
import * as Collapsible from '@radix-ui/react-collapsible'
import { useEffect, useState, type ReactNode } from 'react'
import { useLocation, type NavLinkProps } from 'react-router'
import { cx } from '~/helpers'
import UINavLink from '~/ui/nav-link'
import SecondaryButton from './secondary-button'

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
          <div className="md:hidden px-4 flex w-full">
            {open ? (
              <button className="absolute top-1 right-1 inline-flex items-center justify-center rounded-md p-2 text-pink-900 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
              </button>
            ) : (
              <SecondaryButton className="flex-1 mt-2">
                <span>{menuTitle}</span>
                <ChevronDownIcon className="size-6" aria-hidden="true" />
              </SecondaryButton>
            )}
          </div>
        </Collapsible.Trigger>
        <Collapsible.Content asChild>
          <div className="block md:hidden rounded bg-pink-600 p-2">
            <div className="flex flex-col gap-2 pb-2">{children}</div>
          </div>
        </Collapsible.Content>
        <div className="md:block hidden w-[14rem] bg-pink-600 p-2 min-h-full">
          <div className="flex flex-col gap-2 pb-2">{children}</div>
        </div>
      </nav>
    </Collapsible.Root>
  )
}

function NavTitle({ children }: { children: ReactNode }) {
  return <h4 className="font-medium text-[#480803]">{children}</h4>
}

function NavLink({ className, ...props }: NavLinkProps) {
  return (
    <UINavLink
      className={({ isActive, isPending, isTransitioning }) =>
        cx(
          isActive ? 'bg-pink-900' : 'hover:bg-pink-700',
          typeof className === 'function'
            ? className({ isActive, isPending, isTransitioning })
            : className,
        )
      }
      {...props}
    />
  )
}

function Content({ children }: { children: ReactNode }) {
  return <div className="flex-1">{children}</div>
}

function SidebarRoot({ children }: { children: ReactNode }) {
  return <div className="flex md:flex-row flex-col p-2 md:p-0">{children}</div>
}

const SidebarLayout = Object.assign(SidebarRoot, {
  Nav,
  NavTitle,
  NavLink,
  Content,
})

export { SidebarLayout }
