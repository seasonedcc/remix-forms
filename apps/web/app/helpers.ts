import social from './social.png'
import type { MetaDescriptor } from '@remix-run/node'

function cx(...args: unknown[]): string {
  return args
    .flat()
    .filter((x) => typeof x === 'string')
    .join(' ')
}

function pageTitle(title: string) {
  return `${title} · Remix Forms`
}

const baseMeta = [
  { property: 'author', content: 'Seasoned' },
  { property: 'og:type', content: 'website' },
  { property: 'og:image', content: social },
  { property: 'og:site_name', content: 'Remix Forms' },
]

function metaTags({
  title: rawTitle,
  description,
}: {
  title: string
  description?: string
}): MetaDescriptor[] {
  const title = rawTitle ? pageTitle(rawTitle) : null
  const titleTags: MetaDescriptor[] = title
    ? [{ title }, { property: 'og:title', content: title }]
    : []

  const descriptionTags: MetaDescriptor[] = description
    ? [{ description }, { property: 'og:description', content: description }]
    : []

  return [...titleTags, ...descriptionTags, ...baseMeta]
}

export { cx, pageTitle, metaTags, baseMeta }
