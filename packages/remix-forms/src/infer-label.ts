function startCase(str: string): string {
  const matches = str.match(
    /[\p{Lu}]{2,}(?=[\p{Lu}][\p{Ll}]+[\p{N}]*|\b)|[\p{Lu}]?[\p{Ll}]+[\p{N}]*|[\p{Lu}]|[\p{N}]+/gu
  ) ?? ['']

  return matches.map((x) => x.charAt(0).toUpperCase() + x.slice(1)).join(' ')
}

function inferLabel(fieldName: string) {
  return startCase(fieldName).replace(/Url/g, 'URL')
}

export { inferLabel }
