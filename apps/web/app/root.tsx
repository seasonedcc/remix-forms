import type { LinksFunction } from '@remix-run/node'
import {
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useMatches,
} from '@remix-run/react'
import colors from 'tailwindcss/colors'
import styles from './styles/app.css?url'
import highlightStyles from 'highlight.js/styles/a11y-dark.css?url'
import favicon from './favicon.png'
import ExternalLink from './ui/external-link'
import TopBar from './ui/top-bar'
import ConfTopBar from './ui/conf/top-bar'
import { GlobalLoading } from './ui/global-loading'
import { baseMeta } from './helpers'

export const meta = () => baseMeta

export const links: LinksFunction = () => {
  return [
    {
      rel: 'icon',
      href: favicon,
      type: 'image/png',
    },
    { rel: 'stylesheet', href: styles },
    { rel: 'stylesheet', href: highlightStyles },
  ]
}

export function Layout({ children }: { children: React.ReactNode }) {
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
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  const matches = useMatches()
  const conf = matches.find((match) => match.pathname === '/conf')

  return (
    <>
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
    </>
  )
}
