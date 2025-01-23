function startCase(str: string): string {
  const matches = str.match(
    /[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g,
  ) ?? ['']
  return matches.map((x) => x.charAt(0).toUpperCase() + x.slice(1)).join(' ')
}

function inferLabel(fieldName: string) {
  return startCase(fieldName).replace(/Url/g, 'URL')
}

export { inferLabel }
