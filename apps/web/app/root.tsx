import 'highlight.js/styles/a11y-dark.css'
import type { LinksFunction, UIMatch } from 'react-router'
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router'
import { config } from 'zod'
import en from 'zod/v4/locales/en.js'
import type { Route } from './+types/root'
import favicon from './favicon.png'
import seasonedIconDark from './seasoned-icon-dark.webp'
import seasonedIconLight from './seasoned-icon-light.webp'
import './tailwind.css'
import { ColorSchemeImg } from './ui/color-scheme-img'
import { GlobalLoading } from './ui/global-loading'
import TopBar from './ui/top-bar'

config(en())

export const links: LinksFunction = () => {
  return [{ rel: 'icon', href: favicon, type: 'image/png' }]
}

export default function App({ matches }: Route.ComponentProps) {
  const match = matches.find(
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    (match) => match?.handle && 'topBar' in (match.handle as any)
  ) as UIMatch<unknown, { topBar: React.ReactNode }>
  const secondTopBar = match?.handle.topBar || null

  return (
    <html lang="en" className="h-full overflow-x-hidden bg-base-100">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="flex min-h-screen w-screen max-w-[100vw] flex-col overflow-y-auto overflow-x-hidden bg-base-100 text-base-content antialiased">
        <GlobalLoading />
        <TopBar />
        {secondTopBar}
        <main className="flex flex-1 flex-col">
          <Outlet />
        </main>
        <footer className="flex justify-center bg-base-200 p-4">
          <a
            href="https://seasoned.cc"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4"
          >
            <ColorSchemeImg
              lightSrc={seasonedIconLight}
              darkSrc={seasonedIconDark}
              alt="Seasoned"
              title="Seasoned"
              className="h-5"
              height={20}
              width={14}
            />
            <div>Made by Seasoned</div>
          </a>
        </footer>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}
