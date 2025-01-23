import { kebabCase } from 'lodash-es'
import { Fragment } from 'react'
import { Outlet } from 'react-router'
import { exampleRouteGroups } from '~/routes'
import { SidebarLayout } from '~/ui/sidebar-layout'

export default function Component() {
  return (
    <div className="relative isolate flex grow flex-col">
      <SidebarLayout>
        <SidebarLayout.Nav>
          {Object.entries(exampleRouteGroups).map(([group, paths]) => (
            <Fragment key={group}>
              <SidebarLayout.NavTitle>{group}</SidebarLayout.NavTitle>
              {paths.map((path) => (
                <SidebarLayout.NavLink
                  key={path}
                  to={`/examples/${kebabCase(group)}/${kebabCase(path)}`}
                >
                  {path}
                </SidebarLayout.NavLink>
              ))}
            </Fragment>
          ))}
        </SidebarLayout.Nav>
        <SidebarLayout.Content>
          <div className="flex flex-col space-y-4 p-4 text-gray-200 sm:space-y-8 sm:p-8">
            <Outlet />
          </div>
        </SidebarLayout.Content>
      </SidebarLayout>
    </div>
  )
}
