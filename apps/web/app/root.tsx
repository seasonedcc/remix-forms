import 'highlight.js/styles/a11y-dark.css'
import type { LinksFunction } from 'react-router'
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router'
import { config } from 'zod'
import en from 'zod/v4/locales/en.js'
import favicon from './favicon.png'
import seasonedIconDark from './seasoned-icon-dark.webp'
import seasonedIconLight from './seasoned-icon-light.webp'
import './tailwind.css'
import { ColorSchemeImg } from './ui/color-scheme-img'
import { GlobalLoading } from './ui/global-loading'
import TopBar from './ui/top-bar'

config(en())

export const links: LinksFunction = () => [
  { rel: 'icon', href: favicon, type: 'image/png' },
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap',
  },
]

export default function App() {
  return (
    <html lang="en" data-theme="dark" className="h-full overflow-x-hidden">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="flex min-h-screen w-screen max-w-[100vw] flex-col overflow-y-auto overflow-x-hidden bg-base-100 text-base-content antialiased">
        <GlobalLoading />
        <TopBar />
        <main className="flex flex-1 flex-col pt-14">
          <Outlet />
        </main>
        <footer className="flex justify-center border-white/5 border-t bg-base-100 p-8">
          <a
            href="https://www.seasoned.cc"
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
