'use client'

import { useRef, useCallback, useEffect } from 'react'

interface GestureHandlerProps {
  onNextPage: () => void
  onPrevPage: () => void
  onToggleUI: () => void
  children: React.ReactNode
  className?: string
  readingDirection?: 'ltr' | 'rtl'
}

export default function GestureHandler({ 
  onNextPage, 
  onPrevPage, 
  onToggleUI, 
  children, 
  className = '',
  readingDirection = 'rtl'
}: GestureHandlerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null)
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null)
  const isDraggingRef = useRef(false)

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0]
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    }
    isDraggingRef.current = false

    // Start long press detection
    longPressTimerRef.current = setTimeout(() => {
      isDraggingRef.current = true
      // Add visual feedback for long press
      if (containerRef.current) {
        containerRef.current.style.cursor = 'grabbing'
      }
    }, 500)
  }, [])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!touchStartRef.current) return

    const touch = e.touches[0]
    const deltaX = Math.abs(touch.clientX - touchStartRef.current.x)
    const deltaY = Math.abs(touch.clientY - touchStartRef.current.y)

    // If moved significantly, cancel long press
    if (deltaX > 10 || deltaY > 10) {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current)
        longPressTimerRef.current = null
      }
    }
  }, [])

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }

    if (containerRef.current) {
      containerRef.current.style.cursor = ''
    }

    if (!touchStartRef.current) return

    const touch = e.changedTouches[0]
    const deltaX = touch.clientX - touchStartRef.current.x
    const deltaY = touch.clientY - touchStartRef.current.y
    const deltaTime = Date.now() - touchStartRef.current.time
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

    // Tap detection
    if (distance < 10 && deltaTime < 300 && !isDraggingRef.current) {
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return

      const tapX = touch.clientX - rect.left
      const tapY = touch.clientY - rect.top
      const centerX = rect.width / 2
      const centerY = rect.height / 2

      // Check if tap is in center area (for UI toggle)
      if (Math.abs(tapX - centerX) < rect.width * 0.2 && Math.abs(tapY - centerY) < rect.height * 0.2) {
        onToggleUI()
        return
      }

      // Left/Right navigation based on reading direction
      if (readingDirection === 'rtl') {
        if (tapX > rect.width * 0.6) {
          onPrevPage()
        } else if (tapX < rect.width * 0.4) {
          onNextPage()
        }
      } else {
        if (tapX > rect.width * 0.6) {
          onNextPage()
        } else if (tapX < rect.width * 0.4) {
          onPrevPage()
        }
      }
    }
    // Swipe detection
    else if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (readingDirection === 'rtl') {
        if (deltaX > 0) {
          onPrevPage()
        } else {
          onNextPage()
        }
      } else {
        if (deltaX > 0) {
          onNextPage()
        } else {
          onPrevPage()
        }
      }
    }

    touchStartRef.current = null
    isDraggingRef.current = false
  }, [onNextPage, onPrevPage, onToggleUI, readingDirection])

  const handleClick = useCallback((e: React.MouseEvent) => {
    // Ignore clicks on interactive elements
    const target = e.target as HTMLElement
    if (target.closest('button, a, input, [role="button"]')) {
      return
    }

    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const centerX = rect.width / 2

    // Center area for UI toggle
    if (Math.abs(clickX - centerX) < rect.width * 0.2) {
      onToggleUI()
      return
    }

    // Left/Right navigation
    if (readingDirection === 'rtl') {
      if (clickX > rect.width * 0.6) {
        onPrevPage()
      } else if (clickX < rect.width * 0.4) {
        onNextPage()
      }
    } else {
      if (clickX > rect.width * 0.6) {
        onNextPage()
      } else if (clickX < rect.width * 0.4) {
        onPrevPage()
      }
    }
  }, [onNextPage, onPrevPage, onToggleUI, readingDirection])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('touchstart', handleTouchStart, { passive: true })
    container.addEventListener('touchmove', handleTouchMove, { passive: true })
    container.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])

  return (
    <div
      ref={containerRef}
      className={`relative select-none ${className}`}
      onClick={handleClick}
      style={{ touchAction: 'manipulation' }}
    >
      {children}
    </div>
  )
}