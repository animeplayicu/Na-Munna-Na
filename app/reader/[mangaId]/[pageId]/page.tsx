'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { 
  ChevronLeft, 
  ChevronRight, 
  Home, 
  Settings, 
  BookOpen,
  Maximize,
  Minimize,
  RotateCw,
  Volume2,
  VolumeX,
  Download,
  Bookmark,
  Share2,
  Eye,
  EyeOff,
  Smartphone,
  Monitor,
  ZoomIn,
  ZoomOut,
  SkipBack,
  SkipForward,
  X,
  Play,
  Pause,
  ScrollText,
  FlipHorizontal,
  FlipVertical,
  BookOpenCheck
} from 'lucide-react'
import { getMangaDxChapterPages, getMangaDxChapter, getMangaDxChapters } from '@/lib/mangadx-api'
import { toast } from 'sonner'
import Image from 'next/image'

interface ReaderSettings {
  readingMode: 'single' | 'double' | 'webtoon' | 'scroll-vertical' | 'scroll-horizontal'
  flipDirection: 'rtl' | 'ltr'
  autoPlay: boolean
  autoPlaySpeed: number
  soundEnabled: boolean
  preloadPages: number
  showUI: boolean
  fullscreen: boolean
  zoom: number
  autoZoom: boolean
  fitMode: 'width' | 'height' | 'page' | 'original'
}

interface PageData {
  url: string
  loaded: boolean
  error: boolean
  width?: number
  height?: number
}

export default function MangaReaderPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const autoPlayIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const mangaId = params.mangaId as string
  const pageId = parseInt(params.pageId as string) || 1
  const chapterId = searchParams.get('chapter')

  const [pages, setPages] = useState<PageData[]>([])
  const [currentPage, setCurrentPage] = useState(pageId)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [chapterInfo, setChapterInfo] = useState<any>(null)
  const [allChapters, setAllChapters] = useState<any[]>([])
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0)
  const [preloadedPages, setPreloadedPages] = useState<Set<number>>(new Set())

  const [settings, setSettings] = useState<ReaderSettings>(() => {
    // Try to load from localStorage
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem('mangaReaderSettings')
      if (savedSettings) {
        return JSON.parse(savedSettings)
      }
    }
    // Default settings
    return {
      readingMode: 'single',
      flipDirection: 'rtl',
      autoPlay: false,
      autoPlaySpeed: 10,
      soundEnabled: true,
      preloadPages: 3,
      showUI: true,
      fullscreen: false,
      zoom: 100,
      autoZoom: true,
      fitMode: 'width'
    }
  })

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mangaReaderSettings', JSON.stringify(settings))
    }
  }, [settings])

  const [showSettings, setShowSettings] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Detect mobile devices
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Force landscape in mobile double page view
  useEffect(() => {
    if (isMobile && settings.readingMode === 'double') {
      try {
        // @ts-ignore - TypeScript doesn't know screen.orientation
        screen.orientation.lock('landscape')
      } catch (e) {
        console.log('Orientation lock not supported')
      }
    } else {
      try {
        // @ts-ignore
        screen.orientation.unlock()
      } catch (e) {}
    }
  }, [isMobile, settings.readingMode])

  // Load chapter data
  useEffect(() => {
    if (!chapterId) return

    const loadChapterData = async () => {
      try {
        setLoading(true)
        
        // Load current chapter info
        const chapterResponse = await getMangaDxChapter(chapterId)
        setChapterInfo(chapterResponse.data)

        // Load chapter pages
        const pagesResponse = await getMangaDxChapterPages(chapterId)
        const baseUrl = pagesResponse.baseUrl
        const chapterHash = pagesResponse.chapter.hash
        const pageFiles = pagesResponse.chapter.data

        const pageUrls = pageFiles.map((file: string) => ({
          url: `${baseUrl}/data/${chapterHash}/${file}`,
          loaded: false,
          error: false
        }))

        setPages(pageUrls)
        setTotalPages(pageUrls.length)

        // Load all chapters for navigation
        const chaptersResponse = await getMangaDxChapters(mangaId)
        const sortedChapters = chaptersResponse.data.sort((a: any, b: any) => {
          const aNum = parseFloat(a.attributes.chapter || "0")
          const bNum = parseFloat(b.attributes.chapter || "0")
          return aNum - bNum
        })
        setAllChapters(sortedChapters)
        
        const currentIndex = sortedChapters.findIndex((ch: any) => ch.id === chapterId)
        setCurrentChapterIndex(currentIndex)

      } catch (error) {
        console.error('Error loading chapter:', error)
        toast.error('Failed to load chapter')
      } finally {
        setLoading(false)
      }
    }

    loadChapterData()
  }, [chapterId, mangaId])

  // Auto-play functionality
  useEffect(() => {
    if (settings.autoPlay && !loading) {
      autoPlayIntervalRef.current = setInterval(() => {
        nextPage()
      }, settings.autoPlaySpeed * 1000)
    } else {
      if (autoPlayIntervalRef.current) {
        clearInterval(autoPlayIntervalRef.current)
        autoPlayIntervalRef.current = null
      }
    }

    return () => {
      if (autoPlayIntervalRef.current) {
        clearInterval(autoPlayIntervalRef.current)
      }
    }
  }, [settings.autoPlay, settings.autoPlaySpeed, loading])

  // Preload pages
  useEffect(() => {
    const preloadPage = (index: number) => {
      if (index < 0 || index >= pages.length || preloadedPages.has(index)) return

      const img = new window.Image()
      img.onload = () => {
        setPages(prev => prev.map((p, i) => 
          i === index ? { ...p, loaded: true, width: img.naturalWidth, height: img.naturalHeight } : p
        ))
        setPreloadedPages(prev => new Set([...prev, index]))
      }
      img.onerror = () => {
        setPages(prev => prev.map((p, i) => 
          i === index ? { ...p, error: true } : p
        ))
      }
      img.src = pages[index].url
    }

    // Preload current page and surrounding pages
    const startIndex = Math.max(0, currentPage - 1 - settings.preloadPages)
    const endIndex = Math.min(pages.length, currentPage - 1 + settings.preloadPages + 1)

    for (let i = startIndex; i < endIndex; i++) {
      preloadPage(i)
    }
  }, [currentPage, pages, settings.preloadPages, preloadedPages])

  const playFlipSound = () => {
    if (!settings.soundEnabled) return
    
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1)
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.1)
  }

  const navigateToPage = (page: number) => {
    if (page < 1 || page > totalPages || isTransitioning) return
    
    setIsTransitioning(true)
    setCurrentPage(page)
    
    if (settings.soundEnabled) {
      playFlipSound()
    }
    
    // Update URL
    router.replace(`/reader/${mangaId}/${page}?chapter=${chapterId}`, { scroll: false })
    
    setTimeout(() => setIsTransitioning(false), 300)
  }

  const nextPage = () => {
    if (settings.readingMode === 'double' && currentPage < totalPages) {
      // Handle dual page navigation
      if (currentPage === 1) {
        navigateToPage(2)
      } else {
        const nextPageNum = currentPage + 2
        if (nextPageNum <= totalPages) {
          navigateToPage(nextPageNum)
        } else if (currentPage < totalPages) {
          navigateToPage(totalPages)
        } else {
          nextChapter()
        }
      }
    } else {
      if (currentPage < totalPages) {
        navigateToPage(currentPage + 1)
      } else {
        nextChapter()
      }
    }
  }

  const prevPage = () => {
    if (settings.readingMode === 'double' && currentPage > 1) {
      // Handle dual page navigation
      if (currentPage === totalPages && totalPages % 2 === 0) {
        navigateToPage(currentPage - 1)
      } else {
        const prevPageNum = currentPage - 2
        if (prevPageNum >= 1) {
          navigateToPage(prevPageNum)
        } else {
          navigateToPage(1)
        }
      }
    } else {
      if (currentPage > 1) {
        navigateToPage(currentPage - 1)
      } else {
        prevChapter()
      }
    }
  }

  const nextChapter = () => {
    if (currentChapterIndex < allChapters.length - 1) {
      const nextChapter = allChapters[currentChapterIndex + 1]
      router.push(`/reader/${mangaId}/1?chapter=${nextChapter.id}`)
    }
  }

  const prevChapter = () => {
    if (currentChapterIndex > 0) {
      const prevChapter = allChapters[currentChapterIndex - 1]
      router.push(`/reader/${mangaId}/1?chapter=${prevChapter.id}`)
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setSettings(prev => ({ ...prev, fullscreen: true }))
    } else {
      document.exitFullscreen()
      setSettings(prev => ({ ...prev, fullscreen: false }))
    }
  }

  const toggleAutoPlay = () => {
    setSettings(prev => ({ ...prev, autoPlay: !prev.autoPlay }))
  }

  const handleZoomChange = (value: number[]) => {
    setSettings(prev => ({ ...prev, zoom: value[0], autoZoom: false }))
  }

  const resetZoom = () => {
    setSettings(prev => ({ ...prev, zoom: 100, autoZoom: true }))
  }

  // Get pages to display based on reading mode
  const getPagesToDisplay = () => {
    if (settings.readingMode === 'double') {
      if (currentPage === 1) {
        return [currentPage - 1] // Show only first page
      } else {
        // Show current page and previous page as spread
        const leftPage = currentPage % 2 === 0 ? currentPage - 1 : currentPage
        const rightPage = leftPage + 1
        return rightPage <= totalPages ? [leftPage - 1, rightPage - 1] : [leftPage - 1]
      }
    } else if (settings.readingMode === 'webtoon' || settings.readingMode === 'scroll-vertical') {
      return pages.map((_, index) => index) // Show all pages
    } else {
      return [currentPage - 1] // Show single page
    }
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return

      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault()
          settings.flipDirection === 'rtl' ? nextPage() : prevPage()
          break
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault()
          settings.flipDirection === 'rtl' ? prevPage() : nextPage()
          break
        case 'ArrowUp':
          e.preventDefault()
          if (settings.readingMode === 'scroll-vertical') {
            scrollContainerRef.current?.scrollBy(0, -200)
          } else {
            prevPage()
          }
          break
        case 'ArrowDown':
          e.preventDefault()
          if (settings.readingMode === 'scroll-vertical') {
            scrollContainerRef.current?.scrollBy(0, 200)
          } else {
            nextPage()
          }
          break
        case 'f':
        case 'F':
          e.preventDefault()
          toggleFullscreen()
          break
        case 'h':
        case 'H':
          e.preventDefault()
          setSettings(prev => ({ ...prev, showUI: !prev.showUI }))
          break
        case 's':
        case 'S':
          e.preventDefault()
          setShowSettings(!showSettings)
          break
        case ' ':
          e.preventDefault()
          toggleAutoPlay()
          break
        case 'Escape':
          setShowSettings(false)
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [settings, showSettings])

  // Handle click events for navigation
  const handleClick = (e: React.MouseEvent) => {
    // Ignore clicks on interactive elements
    const target = e.target as HTMLElement
    if (target.closest('button, a, input, [role="button"]')) {
      return
    }
    
    if (!containerRef.current) return
    
    const rect = containerRef.current.getBoundingClientRect()
    const xPos = e.clientX - rect.left
    const width = rect.width
    
    // Double click in center to toggle UI
    if (e.detail === 2 && xPos > width * 0.4 && xPos < width * 0.6) {
      setSettings(prev => ({...prev, showUI: !prev.showUI}))
      return
    }
    
    // Left side - previous page
    if (xPos < width * 0.4) {
      prevPage()
    } 
    // Right side - next page
    else if (xPos > width * 0.6) {
      nextPage()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-2 md:p-4">
        <div className="w-[95vw] md:w-[90vw] max-w-[calc(16/9*(100vh-2rem))] h-[calc(100vh-2rem)] aspect-[9/16] bg-white shadow-lg relative overflow-hidden">
          <style jsx global>{`
            @keyframes loading-shine {
              0% { background-position: -200% 0; }
              100% { background-position: 200% 0; }
            }
            .loading-shimmer {
              background: linear-gradient(90deg, #f3f4f6 8%, #e5e7eb 18%, #f3f4f6 33%);
              background-size: 200% 100%;
              animation: loading-shine 2s infinite linear;
            }
          `}</style>
          
          <div className="h-full flex flex-col p-2 md:p-4 gap-3 md:gap-4">
            {/* Top section - 2 boxes */}
            <div className="flex gap-2 md:gap-4 justify-center">
              <div className="h-20 md:h-24 w-1/4 rounded-sm loading-shimmer"></div>
              <div className="h-20 md:h-24 w-1/4 rounded-sm loading-shimmer"></div>
            </div>
            
            {/* Middle section - triangles */}
            <div className="flex-1 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-1/2 h-full relative">
                  <div className="absolute inset-0 loading-shimmer" style={{
                    clipPath: 'polygon(0% 100%, 100% 100%, 0% 0%)',
                    right: '0.5cm',
                    maskImage: 'radial-gradient(circle at 0% 100%, transparent 5%, black 5.5%) radial-gradient(circle at 0% 0%, transparent 3%, black 3.5%)',
                    WebkitMaskImage: 'radial-gradient(circle at 0% 100%, transparent 5%, black 5.5%) radial-gradient(circle at 0% 0%, transparent 3%, black 3.5%)',
                    borderRadius: '0.5cm'
                  }}></div>
                  <div className="absolute inset-0 loading-shimmer" style={{
                    clipPath: 'polygon(100% 0%, 100% 100%, 0% 0%)',
                    left: '0.5cm',
                    maskImage: 'radial-gradient(circle at 100% 0%, transparent 5%, black 5.5%) radial-gradient(circle at 100% 100%, transparent 3%, black 3.5%)',
                    WebkitMaskImage: 'radial-gradient(circle at 100% 0%, transparent 5%, black 5.5%) radial-gradient(circle at 100% 100%, transparent 3%, black 3.5%)',
                    borderRadius: '0.5cm'
                  }}></div>
                </div>
              </div>
            </div>
            
            {/* Bottom section - 2 boxes */}
            <div className="flex gap-2 md:gap-4 justify-center">
              <div className="h-20 md:h-24 w-1/4 rounded-sm loading-shimmer"></div>
              <div className="h-20 md:h-24 w-1/4 rounded-sm loading-shimmer"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="min-h-screen bg-black text-white relative overflow-hidden"
      onClick={handleClick}
    >
      {/* Top Navigation Bar */}
      {settings.showUI && (
        <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent p-4 transition-all duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(`/manga/${mangaId}`)}
              className="text-white hover:bg-white/20"
            >
              <Home className="w-5 h-5" />
            </Button>
            
            <div className="text-sm">
              <div className="font-semibold">
                {chapterInfo?.attributes?.title || `Chapter ${chapterInfo?.attributes?.chapter || '?'}`}
              </div>
              <div className="text-gray-400">
                Page {currentPage} of {totalPages}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-white/20">
              {settings.readingMode.toUpperCase()}
            </Badge>
            
            {settings.autoPlay && (
              <Badge variant="secondary" className="bg-green-600/20 text-green-400">
                AUTO {settings.autoPlaySpeed}s
              </Badge>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSettings(prev => ({ ...prev, showUI: !prev.showUI }))}
              className="text-white hover:bg-white/20"
            >
              {settings.showUI ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings(!showSettings)}
              className="text-white hover:bg-white/20"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
      )}

      {/* Main Reader Area */}
      <div 
        ref={containerRef}
        className="relative w-full h-screen"
      >
        {settings.readingMode === 'double' ? (
          <div className={`flex w-full ${isMobile ? 'h-[100vw] w-[100vh]' : 'h-screen'} overflow-hidden justify-center items-center`}>
            {/* Combined page container */}
            <div className="flex h-full">
              {/* Left Page */}
              <div className="relative h-full aspect-[3/4] max-w-full -mr-[21px] z-10">
                {pages[currentPage - 1]?.url && (
                  <Image
                    src={pages[currentPage - 1].url}
                    alt={`Page ${currentPage}`}
                    fill
                    className="object-contain"
                    priority
                  />
                )}
              </div>
              
              {/* Right Page */}
              <div className="relative h-full aspect-[3/4] max-w-full -ml-[21px] z-10">
                {pages[currentPage]?.url && (
                  <Image
                    src={pages[currentPage].url}
                    alt={`Page ${currentPage + 1}`}
                    fill
                    className="object-contain"
                    priority
                  />
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Single page modes */
          getPagesToDisplay().map((pageIndex) => (
            <div 
              key={pageIndex} 
              className={`absolute inset-0 flex items-center justify-center ${currentPage === pageIndex + 1 ? 'opacity-100' : 'opacity-0'}`}
              style={{ height: '100vh' }}
            >
              {pages[pageIndex]?.url ? (
                <div className="relative w-full h-full min-h-[80vh]">
                  <Image
                    src={pages[pageIndex].url}
                    alt={`Page ${pageIndex + 1}`}
                    fill
                    className="object-contain"
                    priority
                    onLoad={() => {
                      setPages(prev => prev.map((p, i) => 
                        i === pageIndex ? {...p, loaded: true} : p
                      ))
                    }}
                  />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-12 h-12 border-4 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Bottom Navigation */}
      {settings.showUI && (
        <div className="absolute bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={prevChapter}
                disabled={currentChapterIndex === 0}
                className="text-white hover:bg-white/20 disabled:opacity-50"
              >
                <SkipBack className="w-5 h-5" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={prevPage}
                disabled={currentPage === 1 && currentChapterIndex === 0}
                className="text-white hover:bg-white/20 disabled:opacity-50"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleAutoPlay}
                className={`text-white hover:bg-white/20 ${settings.autoPlay ? 'bg-green-600/20' : ''}`}
              >
                {settings.autoPlay ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </Button>

              <div className="text-center">
                <div className="text-sm text-gray-400">
                  {currentPage} / {totalPages}
                </div>
                <div className="w-32 h-1 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-red-500 transition-all duration-300"
                    style={{ width: `${(currentPage / totalPages) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={nextPage}
                disabled={currentPage === totalPages && currentChapterIndex === allChapters.length - 1}
                className="text-white hover:bg-white/20 disabled:opacity-50"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={nextChapter}
                disabled={currentChapterIndex === allChapters.length - 1}
                className="text-white hover:bg-white/20 disabled:opacity-50"
              >
                <SkipForward className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Card className="bg-gray-900 border-gray-700 p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Reader Settings</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-6">
              {/* Reading Mode */}
              <div>
                <label className="text-sm font-medium text-gray-300 mb-3 block">
                  Reading Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'single', label: 'Single', icon: Smartphone },
                    { value: 'double', label: 'Double', icon: Monitor },
                    { value: 'webtoon', label: 'Webtoon', icon: ScrollText },
                    { value: 'scroll-vertical', label: 'Scroll V', icon: FlipVertical },
                    { value: 'scroll-horizontal', label: 'Scroll H', icon: FlipHorizontal }
                  ].map((mode) => {
                    const Icon = mode.icon
                    return (
                      <Button
                        key={mode.value}
                        variant={settings.readingMode === mode.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSettings(prev => ({ ...prev, readingMode: mode.value as any }))}
                        className="flex flex-col gap-1 h-auto py-2"
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-xs">{mode.label}</span>
                      </Button>
                    )
                  })}
                </div>
              </div>

              {/* Zoom Controls */}
              <div>
                <label className="text-sm font-medium text-gray-300 mb-3 block">
                  Zoom: {settings.zoom}%
                </label>
                <div className="space-y-3">
                  <Slider
                    value={[settings.zoom]}
                    onValueChange={handleZoomChange}
                    min={50}
                    max={300}
                    step={10}
                    className="w-full"
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleZoomChange([settings.zoom - 10])}
                      className="flex-1"
                    >
                      <ZoomOut className="w-4 h-4 mr-1" />
                      -
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetZoom}
                      className="flex-1"
                    >
                      Reset
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleZoomChange([settings.zoom + 10])}
                      className="flex-1"
                    >
                      <ZoomIn className="w-4 h-4 mr-1" />
                      +
                    </Button>
                  </div>
                </div>
              </div>

              {/* Auto Play */}
              <div>
                <label className="text-sm font-medium text-gray-300 mb-3 block">
                  Auto Play: {settings.autoPlaySpeed}s
                </label>
                <div className="space-y-3">
                  <Slider
                    value={[settings.autoPlaySpeed]}
                    onValueChange={(value) => setSettings(prev => ({ ...prev, autoPlaySpeed: value[0] }))}
                    min={3}
                    max={180}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Auto Play</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleAutoPlay}
                      className={`text-gray-400 hover:text-white ${settings.autoPlay ? 'text-green-400' : ''}`}
                    >
                      {settings.autoPlay ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Reading Direction */}
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Reading Direction
                </label>
                <div className="flex gap-2">
                  <Button
                    variant={settings.flipDirection === 'rtl' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSettings(prev => ({ ...prev, flipDirection: 'rtl' }))}
                    className="flex-1"
                  >
                    Right to Left
                  </Button>
                  <Button
                    variant={settings.flipDirection === 'ltr' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSettings(prev => ({ ...prev, flipDirection: 'ltr' }))}
                    className="flex-1"
                  >
                    Left to Right
                  </Button>
                </div>
              </div>

              {/* Other Settings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-300">Sound Effects</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSettings(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }))}
                    className="text-gray-400 hover:text-white"
                  >
                    {settings.soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-300">Fullscreen</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleFullscreen}
                    className="text-gray-400 hover:text-white"
                  >
                    {settings.fullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-700">
              <div className="text-xs text-gray-500 space-y-1">
                <div>• Use arrow keys or A/D to navigate</div>
                <div>• Press F for fullscreen</div>
                <div>• Press H to hide/show UI</div>
                <div>• Press Space for auto-play</div>
                <div>• Press S for settings</div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Loading Overlay */}
      {isTransitioning && (
        <div className="absolute inset-0 z-40 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      )}
    </div>
  )
}