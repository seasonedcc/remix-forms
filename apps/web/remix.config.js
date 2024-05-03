/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  serverBuildTarget: 'netlify',
  server: './server.js',
  ignoredRouteFiles: ['**/.*'],
  watchPaths: ['../../packages/remix-forms'],
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // serverBuildPath: ".netlify/functions-internal/server.js",
  // publicPath: "/build/",
  future: {
    v2_meta: true,
    v2_routeConvention: true,
  },
  mdx: async (filename) => {
    const [rehypeHighlight] = await Promise.all([
      import('rehype-highlight').then((mod) => mod.default),
    ])
    return {
      rehypePlugins: [rehypeHighlight],
    }
  },
  devServerPort: 8002,
}
