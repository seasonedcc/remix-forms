function startCase(str: string): string {
  const words = str.match(
    /[\p{Lu}]{2,}(?=[\p{Lu}][\p{Ll}]|[\p{N}]|\b)|[\p{Lu}]?[\p{Ll}]+(?:'\p{Ll}+)?(?:[\p{N}]*)|'\p{Ll}+|[\p{Lu}]|[\p{N}]+/gu
  ) ?? ['']

  const format = (w: string) => {
    if (w.startsWith("'") && w.length > 2) {
      return `'${w[1].toUpperCase()}${w.slice(2)}`
    }
    return w.charAt(0).toUpperCase() + w.slice(1)
  }

  return words.reduce((acc, word, index) => {
    const formatted = format(word)
    if (index === 0) return formatted
    if (word.startsWith("'")) return acc + formatted
    return `${acc} ${formatted}`
  }, '')
}

function inferLabel(fieldName: string) {
  return startCase(fieldName).replace(/Url/g, 'URL')
}

export { inferLabel, startCase }
