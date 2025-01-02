import { flatRoutes } from '@remix-run/fs-routes'
import { RouteConfig } from '@remix-run/route-config'

export default [...(await flatRoutes())] satisfies RouteConfig
