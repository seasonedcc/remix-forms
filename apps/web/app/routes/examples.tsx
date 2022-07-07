import { Outlet } from '@remix-run/react'
import { $path } from 'remix-routes'
import SidebarLayout from '~/ui/sidebar-layout'

export default function Component() {
  return (
    <div className="relative isolate flex grow flex-col">
      <SidebarLayout>
        <SidebarLayout.Nav>
          <SidebarLayout.NavTitle>Actions</SidebarLayout.NavTitle>
          <SidebarLayout.NavLink to={$path('/examples/actions/redirect')}>
            Redirect
          </SidebarLayout.NavLink>
          <SidebarLayout.NavLink
            to={$path('/examples/actions/without-redirect')}
          >
            Without redirect
          </SidebarLayout.NavLink>
          <SidebarLayout.NavLink
            to={$path('/examples/actions/custom-response')}
          >
            Custom response
          </SidebarLayout.NavLink>
          <SidebarLayout.NavLink to={$path('/examples/actions/environment')}>
            Environment
          </SidebarLayout.NavLink>
          <SidebarLayout.NavLink to={$path('/examples/actions/global-error')}>
            Global error
          </SidebarLayout.NavLink>
          <SidebarLayout.NavLink to={$path('/examples/actions/field-error')}>
            Field error
          </SidebarLayout.NavLink>
          <SidebarLayout.NavTitle>Modes</SidebarLayout.NavTitle>
          <SidebarLayout.NavLink to={$path('/examples/modes/on-submit')}>
            onSubmit
          </SidebarLayout.NavLink>
          <SidebarLayout.NavLink to={$path('/examples/modes/on-blur')}>
            onBlur
          </SidebarLayout.NavLink>
          <SidebarLayout.NavLink to={$path('/examples/modes/on-change')}>
            onChange
          </SidebarLayout.NavLink>
          <SidebarLayout.NavTitle>Schemas</SidebarLayout.NavTitle>
          <SidebarLayout.NavLink to={$path('/examples/schemas/strings')}>
            Strings
          </SidebarLayout.NavLink>
          <SidebarLayout.NavLink to={$path('/examples/schemas/numbers')}>
            Numbers
          </SidebarLayout.NavLink>
          <SidebarLayout.NavLink to={$path('/examples/schemas/booleans')}>
            Booleans
          </SidebarLayout.NavLink>
          <SidebarLayout.NavLink to={$path('/examples/schemas/dates')}>
            Dates
          </SidebarLayout.NavLink>
          <SidebarLayout.NavLink to={$path('/examples/schemas/enums')}>
            Enums
          </SidebarLayout.NavLink>
          <SidebarLayout.NavTitle>Forms</SidebarLayout.NavTitle>
          <SidebarLayout.NavLink to={$path('/examples/forms/auto-generated')}>
            Auto-generated
          </SidebarLayout.NavLink>
          <SidebarLayout.NavLink
            to={$path('/examples/forms/labels-and-options')}
          >
            Labels, options, etc
          </SidebarLayout.NavLink>
          <SidebarLayout.NavLink to={$path('/examples/forms/hidden-field')}>
            Hidden field
          </SidebarLayout.NavLink>
          <SidebarLayout.NavLink
            to={$path('/examples/forms/form-with-children')}
          >
            Form with children
          </SidebarLayout.NavLink>
          <SidebarLayout.NavLink
            to={$path('/examples/forms/field-with-children')}
          >
            Field with children
          </SidebarLayout.NavLink>
          <SidebarLayout.NavLink to={$path('/examples/forms/field-layout')}>
            Field layout
          </SidebarLayout.NavLink>
          <SidebarLayout.NavLink to={$path('/examples/forms/custom-input')}>
            Custom input
          </SidebarLayout.NavLink>
          <SidebarLayout.NavLink to={$path('/examples/forms/async-validation')}>
            Async validation
          </SidebarLayout.NavLink>
          <SidebarLayout.NavLink to={$path('/examples/forms/use-fetcher')}>
            useFetcher
          </SidebarLayout.NavLink>
          <SidebarLayout.NavTitle>renderField</SidebarLayout.NavTitle>
          <SidebarLayout.NavLink
            to={$path('/examples/render-field/required-indicator')}
          >
            Required indicator
          </SidebarLayout.NavLink>
          <SidebarLayout.NavLink
            to={$path('/examples/render-field/error-indicator')}
          >
            Error indicator
          </SidebarLayout.NavLink>
          <SidebarLayout.NavLink
            to={$path('/examples/render-field/inline-checkboxes')}
          >
            Inline checkboxes
          </SidebarLayout.NavLink>
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
