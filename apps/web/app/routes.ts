import { flatRoutes } from '@react-router/fs-routes'
import { RouteConfig } from '@react-router/dev/routes'

export default [...(await flatRoutes())] satisfies RouteConfig
