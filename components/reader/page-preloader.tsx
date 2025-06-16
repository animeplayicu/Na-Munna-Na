'use client'

import { useState, useEffect, useCallback } from 'react'

interface PageData {
  url: string
  loaded: boolean
  error: boolean
  width?: number
  height?: number
}

interface PagePreloaderProps {
  pages: string[]
  currentPage: number
  onPageLoad: (index: number, data: { width: number; height: number }) => void
  preloadCount?: number
}

export function usePagePreloader({ 
  pages, 
  currentPage, 
  onPageLoad, 
  preloadCount = 2 
}: PagePreloaderProps) {
  const [pageData, setPageData] = useState<PageData[]>([])

  useEffect(() => {
    setPageData(pages.map(url => ({ url, loaded: false, error: false })))
  }, [pages])

  const preloadPage = useCallback((index: number) => {
    if (index < 0 || index >= pages.length || pageData[index]?.loaded || pageData[index]?.error) {
      return
    }

    const img = new Image()
    img.onload = () => {
      setPageData(prev => prev.map((page, i) => 
        i === index 
          ? { ...page, loaded: true, width: img.naturalWidth, height: img.naturalHeight }
          : page
      ))
      onPageLoad(index, { width: img.naturalWidth, height: img.naturalHeight })
    }
    
    img.onerror = () => {
      setPageData(prev => prev.map((page, i) => 
        i === index ? { ...page, error: true } : page
      ))
    }
    
    img.src = pages[index]
  }, [pages, pageData, onPageLoad])

  useEffect(() => {
    // Preload current page and next pages
    const startIndex = Math.max(0, currentPage - 1)
    const endIndex = Math.min(pages.length, currentPage + preloadCount)
    
    for (let i = startIndex; i < endIndex; i++) {
      preloadPage(i)
    }
  }, [currentPage, preloadPage, preloadCount, pages.length])

  return pageData
}