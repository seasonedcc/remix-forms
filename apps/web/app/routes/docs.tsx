import { Outlet } from '@remix-run/react'
import SidebarLayout from '~/ui/sidebar-layout'

export default function Component() {
  return (
    <div className="relative isolate flex grow flex-col">
      <SidebarLayout>
        <SidebarLayout.Nav>
          <SidebarLayout.NavTitle>Docs</SidebarLayout.NavTitle>
          <SidebarLayout.NavLink to={'/docs/create-form-action'}>
            createFormAction
          </SidebarLayout.NavLink>
        </SidebarLayout.Nav>
        <SidebarLayout.Content>
          <div className="flex flex-col space-y-4 p-4 text-gray-200 sm:space-y-8 sm:p-8">
            <div className="prose lg:prose-xl">
              <Outlet />
            </div>
          </div>
        </SidebarLayout.Content>
      </SidebarLayout>
    </div>
  )
}
