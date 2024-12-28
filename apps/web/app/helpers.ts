import type { HtmlMetaDescriptor } from '@remix-run/node'

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
  ...otherTags
}: Record<string, string>) {
  const title = rawTitle ? pageTitle(rawTitle) : null
  const titleTags = title ? { title, 'og:title': title } : {}

  const descriptionTags = description
    ? { description, 'og:description': description }
    : {}

  return {
    ...titleTags,
    ...descriptionTags,
    ...otherTags,
  } as HtmlMetaDescriptor
}

export { cx, pageTitle, metaTags }
