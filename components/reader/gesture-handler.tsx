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
    // Prevent default to stop image dragging
    e.preventDefault()
    
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
        // Add haptic feedback if available
        if ('vibrate' in navigator) {
          navigator.vibrate(50)
        }
      }
    }, 500)
  }, [])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    // Prevent default to stop scrolling and image dragging
    e.preventDefault()
    
    if (!touchStartRef.current) return

    const touch = e.touches[0]
    const deltaX = Math.abs(touch.clientX - touchStartRef.current.x)
    const deltaY = Math.abs(touch.clientY - touchStartRef.current.y)

    // If moved significantly, cancel long press
    if (deltaX > 15 || deltaY > 15) {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current)
        longPressTimerRef.current = null
      }
    }
  }, [])

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    // Prevent default to stop any default touch behavior
    e.preventDefault()
    
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
    if (distance < 15 && deltaTime < 300 && !isDraggingRef.current) {
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return

      const tapX = touch.clientX - rect.left
      const tapY = touch.clientY - rect.top
      const centerX = rect.width / 2
      const centerY = rect.height / 2

      // Check if tap is in center area (for UI toggle)
      if (Math.abs(tapX - centerX) < rect.width * 0.25 && Math.abs(tapY - centerY) < rect.height * 0.25) {
        onToggleUI()
        return
      }

      // Left/Right navigation based on reading direction
      if (readingDirection === 'rtl') {
        if (tapX > rect.width * 0.65) {
          onPrevPage()
        } else if (tapX < rect.width * 0.35) {
          onNextPage()
        }
      } else {
        if (tapX > rect.width * 0.65) {
          onNextPage()
        } else if (tapX < rect.width * 0.35) {
          onPrevPage()
        }
      }
    }
    // Swipe detection
    else if (Math.abs(deltaX) > 80 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
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

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Prevent default to stop image dragging
    e.preventDefault()
    
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
    if (Math.abs(clickX - centerX) < rect.width * 0.25) {
      onToggleUI()
      return
    }

    // Left/Right navigation
    if (readingDirection === 'rtl') {
      if (clickX > rect.width * 0.65) {
        onPrevPage()
      } else if (clickX < rect.width * 0.35) {
        onNextPage()
      }
    } else {
      if (clickX > rect.width * 0.65) {
        onNextPage()
      } else if (clickX < rect.width * 0.35) {
        onPrevPage()
      }
    }
  }, [onNextPage, onPrevPage, onToggleUI, readingDirection])

  const handleDragStart = useCallback((e: React.DragEvent) => {
    // Prevent all drag operations
    e.preventDefault()
    return false
  }, [])

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    // Prevent context menu to avoid image saving options
    e.preventDefault()
    return false
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Add touch event listeners
    container.addEventListener('touchstart', handleTouchStart, { passive: false })
    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.addEventListener('touchend', handleTouchEnd, { passive: false })

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
      onMouseDown={handleMouseDown}
      onDragStart={handleDragStart}
      onContextMenu={handleContextMenu}
      style={{ 
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none'
      }}
    >
      {children}
    </div>
  )
}