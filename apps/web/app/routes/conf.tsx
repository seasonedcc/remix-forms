import { Link, Outlet, useMatches } from '@remix-run/react'
import { $path } from 'remix-routes'
import ExternalLink from '~/ui/external-link'
import SidebarLayout from '~/ui/sidebar-layout'
import SecondaryButtonLink from '~/ui/secondary-button-link'
import TopBar from '~/ui/conf/top-bar'

export default function Component() {
  const matches = useMatches()
  const { previous, next } =
    matches.filter((match) => match.handle)[0]?.handle || {}

  return (
    <div className="relative isolate flex grow flex-col">
      <SidebarLayout>
        <SidebarLayout.Nav>
          <SidebarLayout.NavTitle>From scratch</SidebarLayout.NavTitle>
          <SidebarLayout.NavLink to={$path('/conf/01')}>
            01. Quick and dirty
          </SidebarLayout.NavLink>
          <SidebarLayout.NavLink to={$path('/conf/02')}>
            02. Server validations
          </SidebarLayout.NavLink>
          <SidebarLayout.NavLink to={$path('/conf/03')}>
            03. Type coercions
          </SidebarLayout.NavLink>
          <SidebarLayout.NavLink to={$path('/conf/04')}>
            04. Client validations
          </SidebarLayout.NavLink>
          <SidebarLayout.NavLink to={$path('/conf/05')}>
            05. Pending UI
          </SidebarLayout.NavLink>
          <SidebarLayout.NavLink to={$path('/conf/06')}>
            06. Accessibility
          </SidebarLayout.NavLink>
          <SidebarLayout.NavLink to={$path('/conf/07')}>
            07. Focus on error
          </SidebarLayout.NavLink>
          <SidebarLayout.NavTitle>Remix Forms</SidebarLayout.NavTitle>
          <SidebarLayout.NavLink to={$path('/conf/08')}>
            08. Auto-generated
          </SidebarLayout.NavLink>
          <SidebarLayout.NavLink to={$path('/conf/09')}>
            09. Custom layout
          </SidebarLayout.NavLink>
        </SidebarLayout.Nav>
        <SidebarLayout.Content>
          <TopBar>
            <div className="hidden flex-1 lg:block">
              This is the{' '}
              <Link to={$path('/conf')} className="underline">
                interactive counterpart
              </Link>{' '}
              to our talk at Remix Conf 2022.{' '}
              <ExternalLink href="https://docs.google.com/presentation/d/1Mp961HsJD9qVElS5VD-szYJ9CkZhnVjJBwMfUahwwek/edit#slide=id.p">
                Get the full slides
              </ExternalLink>
              .
            </div>
            <div className="flex-1 lg:hidden">
              <ExternalLink href="https://docs.google.com/presentation/d/1Mp961HsJD9qVElS5VD-szYJ9CkZhnVjJBwMfUahwwek/edit#slide=id.p">
                Get the full slides
              </ExternalLink>
              .
            </div>
          </TopBar>
          <div className="flex flex-col space-y-4 p-4 text-gray-200 sm:space-y-8 sm:p-8">
            <Outlet />
          </div>
          <div className="mt-8 flex flex-row justify-between p-4 pb-8 sm:mt-0 sm:p-8">
            {previous ? (
              <SecondaryButtonLink to={previous}>Previous</SecondaryButtonLink>
            ) : (
              <div className="invisible" />
            )}
            {next ? (
              <SecondaryButtonLink to={next}>Next</SecondaryButtonLink>
            ) : (
              <div className="invisible" />
            )}
          </div>
        </SidebarLayout.Content>
      </SidebarLayout>
    </div>
  )
}
