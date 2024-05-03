import { compose, join, reject, isBoolean, isNil, flatten } from 'lodash/fp'
import social from './social.png'
import type { V2_MetaDescriptor } from '@remix-run/node'

const cx = (...args: unknown[]) =>
  compose(join(' '), reject(isBoolean), reject(isNil), flatten)(args)

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
}): V2_MetaDescriptor[] {
  const title = rawTitle ? pageTitle(rawTitle) : null
  const titleTags: V2_MetaDescriptor[] = title
    ? [{ title }, { property: 'og:title', content: title }]
    : []

  const descriptionTags: V2_MetaDescriptor[] = description
    ? [{ description }, { property: 'og:description', content: description }]
    : []

  return [...titleTags, ...descriptionTags, ...baseMeta]
}

export { cx, pageTitle, metaTags, baseMeta }
