import { useEffect, useRef, useState } from 'react'
import { domToMarkdown } from '~/utils/dom-to-markdown'

interface CopyPageButtonProps {
  containerSelector?: string
}

export default function CopyPageButton({
  containerSelector = 'main',
}: CopyPageButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleCopy = async () => {
    try {
      const container = document.querySelector(containerSelector)
      if (!container) {
        throw new Error(`Container not found: ${containerSelector}`)
      }
      const markdownContent = domToMarkdown(container)
      await navigator.clipboard.writeText(markdownContent)
      setShowSuccess(true)
      setIsOpen(false)
      setTimeout(() => setShowSuccess(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="relative copy-page-button" ref={dropdownRef}>
      {/* Main Button */}
      <button
        onClick={handleCopy}
        className="flex items-center gap-2 rounded-full border-2 border-gray-200 bg-transparent px-4 py-2 text-sm font-medium text-white transition-colors hover:border-white focus:border-transparent focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-gray-900"
        title="Copy page as Markdown for LLMs"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
        Copy page
      </button>

      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 transform rounded-lg bg-green-600 px-6 py-3 text-white shadow-lg">
          <div className="flex items-center gap-2">
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
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
    </div>
  )
}
