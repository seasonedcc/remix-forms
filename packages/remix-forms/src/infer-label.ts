function startCase(str: string): string {
  const matches = str.match(/\p{L}+(?:'\p{L}+)?|\d+/gu) ?? ['']
  return matches.map((x) => x.charAt(0).toUpperCase() + x.slice(1)).join(' ')
}

function inferLabel(fieldName: string) {
  return startCase(fieldName).replace(/Url/g, 'URL')
}

export { inferLabel }
