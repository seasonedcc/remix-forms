import type { MetaDescriptor } from '@remix-run/node'
import social from './social.png'

function cx(...args: unknown[]) {
  return args
    .flat()
    .filter((x) => typeof x === 'string')
    .join(' ')
    .trim()
}

function pageTitle(title: string) {
  return `${title} · Remix Forms`
}

function metaTags({
  title: rawTitle,
  description,
}: {
  title: string
  description: string
}): MetaDescriptor[] {
  const title = rawTitle ? pageTitle(rawTitle) : null

  return [
    { name: 'author', content: 'Seasoned' },
    { property: 'og:type', content: 'website' },
    { property: 'og:image', content: social },
    { property: 'og:site_name', content: 'Remix Forms' },
    { name: 'title', content: title },
    { name: 'og:title', content: title },
    { name: 'description', content: description },
    { name: 'og:description', content: description },
  ]
}

export { cx, metaTags, pageTitle }
