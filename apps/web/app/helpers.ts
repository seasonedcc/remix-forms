import type { HtmlMetaDescriptor } from '@remix-run/node'

const cx = (...args: unknown[]) => {
  const flattened = args.flat(Infinity)
  const filtered = flattened.filter(
    (arg) => arg != null && typeof arg !== 'boolean',
  )
  return filtered.join(' ')
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
