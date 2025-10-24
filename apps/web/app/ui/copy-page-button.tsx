import { useEffect, useRef, useState } from 'react'
import { domToMarkdown } from '~/utils/dom-to-markdown'
import SecondaryButton from './secondary-button'

interface CopyPageButtonProps {
  containerSelector?: string
}

export default function CopyPageButton({
  containerSelector = 'main',
}: CopyPageButtonProps) {
  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const handleCopy = async () => {
    try {
      const container = document.querySelector(containerSelector)
      if (!container) {
        throw new Error(`Container not found: ${containerSelector}`)
      }
      const markdownContent = domToMarkdown(container)
      await navigator.clipboard.writeText(markdownContent)
      setShowSuccess(true)

      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => setShowSuccess(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
      setShowError(true)

      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => setShowError(false), 2000)
    }
  }

  return (
    <div className="copy-page-button relative">
      {/* Main Button */}
      <SecondaryButton
        onClick={handleCopy}
        className=""
        title="Copy page as Markdown for LLMs"
        aria-label="Copy page as Markdown for LLMs"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
        Copy page
      </SecondaryButton>

      {/* Success Toast */}
      {showSuccess && (
        <div className="-translate-x-1/2 fixed bottom-8 left-1/2 z-50 transform rounded-lg bg-green-600 px-6 py-3 text-white shadow-lg">
          <div className="flex items-center gap-2">
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            Copied to clipboard!
          </div>
        </div>
      )}

      {/* Error Toast */}
      {showError && (
        <div className="-translate-x-1/2 fixed bottom-8 left-1/2 z-50 transform rounded-lg bg-red-600 px-6 py-3 text-white shadow-lg">
          <div className="flex items-center gap-2">
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            Failed to copy!
          </div>
        </div>
      )}
    </div>
  )
}
