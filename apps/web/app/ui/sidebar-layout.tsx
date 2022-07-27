import * as React from 'react'
import { Disclosure, Popover } from '@headlessui/react'
import { cx } from '~/helpers'
import { MenuAlt2Icon, MenuAlt3Icon, XIcon } from '@heroicons/react/outline'
import UINavLink from '~/ui/nav-link'
import type { RemixNavLinkProps } from '@remix-run/react/dist/components'

type SidebarType = 'disclosure' | 'popover'

type NavProps = {
  type?: SidebarType
  close?: Function
} & JSX.IntrinsicElements['nav']

function Nav({ children, type = 'disclosure', close, ...props }: NavProps) {
  const Panel = type === 'disclosure' ? Disclosure.Panel : Popover.Panel
  const Button = type === 'disclosure' ? Disclosure.Button : Popover.Button
  const Icon = type === 'disclosure' ? MenuAlt3Icon : XIcon
  const classes = type === 'disclosure' ? 'min-h-full' : 'absolute top-0'

  return (
    <Panel as="nav" {...props}>
      <div className={cx('z-10 w-[14rem] bg-pink-600 p-2 pb-4', classes)}>
        <div className="flex justify-end p-1">
          <Button className="inline-flex items-center justify-center rounded-md p-1 text-[#480803] hover:bg-pink-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
            <Icon className="block h-6 w-6" />
          </Button>
        </div>
        <div className="-mt-4 flex flex-col space-y-2">
          {React.Children.map(children, (child) => {
            if (!React.isValidElement(child)) return child

            if (child.type === NavLink) {
              return React.cloneElement(child, {
                type,
                close,
              } as React.HTMLAttributes<unknown>)
            }

            return child
          })}
        </div>
      </div>
    </Panel>
  )
}

function NavTitle({ className, ...props }: JSX.IntrinsicElements['h4']) {
  return (
    <h4 className={cx('font-medium text-[#480803]', className)} {...props} />
  )
}

type NavLinkProps = {
  type?: SidebarType
  close?: Function
} & RemixNavLinkProps

function NavLink({
  className,
  type = 'disclosure',
  close = () => {},
  ...props
}: NavLinkProps) {
  return (
    <UINavLink
      className={({ isActive }) =>
        cx(
          isActive ? 'bg-pink-900' : 'hover:bg-pink-700',
          typeof className === 'function' ? className({ isActive }) : className,
        )
      }
      onClick={type === 'popover' ? () => close() : undefined}
      {...props}
    />
  )
}

type ContentProps = { type?: SidebarType } & JSX.IntrinsicElements['div']

function Content({ children, type, className, ...props }: ContentProps) {
  return (
    <div
      className={cx(type === 'disclosure' ? 'flex-1' : 'pl-10', className)}
      {...props}
    >
      {children}
    </div>
  )
}

function Closed({ type }: { type: SidebarType }) {
  const Button = type === 'disclosure' ? Disclosure.Button : Popover.Button

  return (
    <div className={cx('absolute inset-y-0 w-10 bg-pink-600 p-1 md:relative')}>
      <div className="relative h-full">
        <Button className="sticky top-0 inline-flex items-center justify-center rounded-md p-1 text-[#480803] hover:bg-pink-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
          <MenuAlt2Icon className="block h-6 w-6" />
        </Button>
      </div>
    </div>
  )
}

type MapChildren = {
  children: React.ReactNode
  type: SidebarType
  open: boolean
  close: Function
}

function mapChildren({ children, type, close }: MapChildren) {
  return React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) return child

    if (child.type === Nav) {
      return React.cloneElement(child, {
        type,
        close,
      } as React.HTMLAttributes<unknown>)
    }

    if (child.type === Content) {
      return React.cloneElement(child, {
        type,
      } as React.HTMLAttributes<unknown>)
    }

    return child
  })
}

function SidebarRoot({
  children,
  className,
  ...props
}: JSX.IntrinsicElements['div']) {
  return (
    <>
      <Disclosure
        as="div"
        defaultOpen
        className={cx('hidden grow md:flex', className)}
        {...props}
      >
        {({ open, close }) => (
          <>
            {!open && <Closed type="disclosure" />}
            {mapChildren({ children, type: 'disclosure', open, close })}
          </>
        )}
      </Disclosure>
      <Popover as="div" className={cx('md:hidden', className)} {...props}>
        {({ open, close }) => (
          <>
            {!open && <Closed type="popover" />}
            {mapChildren({ children, type: 'popover', open, close })}
          </>
        )}
      </Popover>
    </>
  )
}

const Sidebar = Object.assign(SidebarRoot, { Nav, NavTitle, NavLink, Content })

export default Sidebar
