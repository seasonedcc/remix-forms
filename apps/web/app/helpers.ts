import type { MetaDescriptor } from '@remix-run/node'

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

  return [
    ...Object.entries(titleTags).map(([name, content]) => ({ name, content })),
    ...Object.entries(descriptionTags).map(([name, content]) => ({
      name,
      content,
    })),
    ...Object.entries(otherTags).map(([name, content]) => ({ name, content })),
  ] as MetaDescriptor[]
}

export { cx, pageTitle, metaTags }
