// source: https://github.com/30-seconds/30-seconds-of-code/blob/master/snippets/toTitleCase.md

function startCase(str: string): string {
  const matches = str.match(
    /[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g,
  ) ?? ['']
  return matches.map((x) => x.charAt(0).toUpperCase() + x.slice(1)).join(' ')
}

export { startCase }
