/**
 * Converts DOM elements to Markdown format
 * Works client-side to convert the actual rendered page content
 */

function convertInlineElements(element: Element): string {
  let text = ''

  for (const node of element.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      text += node.textContent || ''
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element
      const tag = el.tagName.toLowerCase()

      switch (tag) {
        case 'a': {
          const href = (el as HTMLAnchorElement).href
          // Recursively process children to handle nested formatting
          const linkText = convertInlineElements(el)
          text += `[${linkText}](${href})`
          break
        }
        case 'em':
        case 'i':
          // Recursively process children to handle nested formatting
          text += `*${convertInlineElements(el)}*`
          break
        case 'strong':
        case 'b':
          // Recursively process children to handle nested formatting
          text += `**${convertInlineElements(el)}**`
          break
        case 'code':
          // Code is typically a leaf element, use textContent
          text += `\`${el.textContent}\``
          break
        case 'br':
          text += '\n\n'
          break
        default:
          // For unknown elements, recursively process children
          text += convertInlineElements(el)
      }
    }
  }

  return text
}

function convertPreElement(preElement: HTMLPreElement): string {
  const text = preElement.textContent?.trim() || ''

  // Try to detect language from classes
  // Only check the pre element and its direct code child, not all descendants
  // (descendant spans may have hljs-keyword, hljs-string, etc. which are token types, not languages)

  let language = ''
  const elementsToCheck: Element[] = [preElement]

  // Check for direct code child
  const codeChild = Array.from(preElement.children).find(
    (child) => child.tagName.toLowerCase() === 'code'
  )
  if (codeChild) {
    elementsToCheck.push(codeChild)
  }

  for (const element of elementsToCheck) {
    const classes = Array.from(element.classList)

    // Look for language-* pattern (common in many syntax highlighters)
    const langClass = classes.find((c) => c.startsWith('language-'))
    if (langClass) {
      language = langClass.replace(/^language-/, '')
      break
    }

    // Check for data-language attribute
    const dataLang = element.getAttribute('data-language')
    if (dataLang) {
      language = dataLang
      break
    }
  }

  // If we found a language, use it
  if (language) {
    return `\`\`\`${language}\n${text}\n\`\`\``
  }

  // Otherwise, return plain code block without language
  return `\`\`\`\n${text}\n\`\`\``
}

function shouldSkipElement(element: Element): boolean {
  // Skip elements with specific classes or data attributes
  const skipSelectors = [
    '[data-skip-markdown]',
    '.copy-page-button',
    'nav',
    'footer',
  ]

  return skipSelectors.some(
    (selector) => element.matches(selector) || element.closest(selector)
  )
}

function convertElement(element: Element): string {
  if (shouldSkipElement(element)) {
    return ''
  }

  const tag = element.tagName.toLowerCase()

  switch (tag) {
    case 'h1':
      return `# ${element.textContent}\n\n`

    case 'h2':
      return `## ${element.textContent}\n\n`

    case 'h3':
      return `### ${element.textContent}\n\n`

    case 'h4':
      return `#### ${element.textContent}\n\n`

    case 'p': {
      const paragraphText = convertInlineElements(element)
      return paragraphText ? `${paragraphText}\n\n` : ''
    }

    case 'pre':
      return `${convertPreElement(element as HTMLPreElement)}\n\n`

    case 'ul':
    case 'ol': {
      let listMarkdown = ''
      const listItems = element.querySelectorAll(':scope > li')
      listItems.forEach((li, index) => {
        const marker = tag === 'ul' ? '-' : `${index + 1}.`
        listMarkdown += `${marker} ${convertInlineElements(li)}\n`
      })
      return `${listMarkdown}\n`
    }

    case 'blockquote': {
      const lines = element.textContent?.split('\n') || []
      return `${lines.map((line) => `> ${line}`).join('\n')}\n\n`
    }

    case 'div':
    case 'section':
    case 'article':
    case 'main': {
      // Process each child individually to maintain spacing
      let containerMarkdown = ''
      for (const child of Array.from(element.children)) {
        containerMarkdown += convertElement(child)
      }
      return containerMarkdown
    }

    default: {
      // For other elements, just process children
      let defaultMarkdown = ''
      for (const child of Array.from(element.children)) {
        defaultMarkdown += convertElement(child)
      }
      return defaultMarkdown
    }
  }
}

export function domToMarkdown(
  container: Element | Document = document
): string {
  let markdown = ''

  const elements =
    container === document
      ? document.querySelectorAll('main > *')
      : container.children

  for (const element of Array.from(elements)) {
    markdown += convertElement(element)
  }

  // Clean up extra newlines
  return markdown.replace(/\n{3,}/g, '\n\n').trim()
}

/**
 * Get markdown for a specific container selector
 */
export function getMarkdownFromSelector(selector: string): string {
  const container = document.querySelector(selector)
  if (!container) {
    throw new Error(`Container not found: ${selector}`)
  }
  return domToMarkdown(container)
}
