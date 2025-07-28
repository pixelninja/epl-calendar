import { useEffect, useRef, useState, useCallback } from 'react'

/**
 * Custom hook for dynamic accordion height animation
 * Calculates exact content height for smooth expand/collapse animations
 */
export function useAccordionHeight(isExpanded: boolean) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [contentHeight, setContentHeight] = useState(0)

  const updateHeight = useCallback(() => {
    if (contentRef.current) {
      // Small delay to ensure content is fully rendered
      requestAnimationFrame(() => {
        if (contentRef.current) {
          // Get the actual height of the content
          const height = contentRef.current.scrollHeight
          setContentHeight(height)
        }
      })
    }
  }, [])

  useEffect(() => {
    if (!contentRef.current) return

    // Update height when expanded state changes
    updateHeight()

    // Also update height if content changes (e.g., fixture updates)
    const resizeObserver = new ResizeObserver(updateHeight)
    resizeObserver.observe(contentRef.current)

    return () => {
      resizeObserver.disconnect()
    }
  }, [isExpanded, updateHeight])

  // Return inline styles for smooth animation
  const getAccordionStyles = () => {
    if (isExpanded) {
      return {
        maxHeight: `${contentHeight}px`,
        opacity: 1
      }
    }
    return {
      maxHeight: '0px',
      opacity: 0
    }
  }

  return {
    contentRef,
    accordionStyles: getAccordionStyles()
  }
}