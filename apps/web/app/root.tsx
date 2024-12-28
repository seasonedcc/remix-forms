import type { LinksFunction, MetaFunction } from '@remix-run/node'
import {
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useMatches,
} from '@remix-run/react'
import highlightStyles from 'highlight.js/styles/a11y-dark.css'
import colors from 'tailwindcss/colors'
import favicon from './favicon.png'
import social from './social.png'
import './tailwind.css'
import ConfTopBar from './ui/conf/top-bar'
import ExternalLink from './ui/external-link'
import { GlobalLoading } from './ui/global-loading'
import TopBar from './ui/top-bar'

export const meta: MetaFunction = () => {
  return [
    { name: 'author', content: 'Seasoned' },
    { property: 'og:type', content: 'website' },
    { property: 'og:image', content: social },
    { property: 'og:site_name', content: 'Remix Forms' },
  ]
}

export const links: LinksFunction = () => {
  return [
    {
      rel: 'icon',
      href: favicon,
      type: 'image/png',
    },
    { rel: 'stylesheet', href: highlightStyles },
  ]
}

export default function App() {
  const matches = useMatches()
  const conf = matches.find((match) => match.pathname === '/conf')

  return (
    <html lang="en" className="h-full overflow-x-hidden">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta name="theme-color" content={colors.gray[900]}></meta>
        <Meta />
        <Links />
      </head>
      <body className="flex min-h-screen w-screen max-w-[100vw] flex-col overflow-y-auto bg-gradient-to-r from-gray-900 to-gray-600 antialiased overflow-x-hidden scrollbar-thin scrollbar-track-gray-500 scrollbar-thumb-gray-700">
        <GlobalLoading />
        <TopBar />
        {!conf && (
          <ConfTopBar>
            <Link to={'/conf'} className="underline">
              Check out our talk
            </Link>{' '}
            at Remix Conf!
          </ConfTopBar>
        )}
        <main className="flex flex-1 flex-col">
          <Outlet />
        </main>
        <footer className="bg-gradient-to-r from-black to-gray-800 p-4 text-center text-white">
          Built with ❤️💪🏼 by{' '}
          <ExternalLink href="https://seasoned.cc">Seasoned</ExternalLink>
        </footer>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}
