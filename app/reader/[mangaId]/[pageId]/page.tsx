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
import { updateReadingHistory } from '@/lib/reading-history'
import { toast } from 'sonner'
import Image from 'next/image'
import PageSkeleton from '@/components/reader/page-skeleton'
import GestureHandler from '@/components/reader/gesture-handler'
import { usePagePreloader } from '@/components/reader/page-preloader'

interface ReaderSettings {
  readingMode: 'single' | 'double' | 'webtoon' | 'scroll-horizontal'
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

interface PageDimensions {
  width: number
  height: number
}

export default function MangaReaderPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const autoPlayIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const pageRefs = useRef<(HTMLDivElement | null)[]>([])

  const mangaId = params.mangaId as string
  const pageId = parseInt(params.pageId as string) || 1
  const chapterId = searchParams.get('chapter')

  const [pages, setPages] = useState<string[]>([])
  const [pageDimensions, setPageDimensions] = useState<Map<number, PageDimensions>>(new Map())
  const [currentPage, setCurrentPage] = useState(pageId)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [chapterInfo, setChapterInfo] = useState<any>(null)
  const [allChapters, setAllChapters] = useState<any[]>([])
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const [settings, setSettings] = useState<ReaderSettings>(() => {
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem('mangaReaderSettings')
      if (savedSettings) {
        return JSON.parse(savedSettings)
      }
    }
    return {
      readingMode: 'single',
      flipDirection: 'rtl',
      autoPlay: false,
      autoPlaySpeed: 10,
      soundEnabled: true,
      preloadPages: 2,
      showUI: true,
      fullscreen: false,
      zoom: 100,
      autoZoom: true,
      fitMode: 'width'
    }
  })

  const [showSettings, setShowSettings] = useState(false)

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

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mangaReaderSettings', JSON.stringify(settings))
    }
  }, [settings])

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

  // Preload pages with proper handling
  const pageData = usePagePreloader({
    pages,
    currentPage: currentPage - 1, // Convert to 0-based index
    onPageLoad: useCallback((index: number, dimensions: PageDimensions) => {
      setPageDimensions(prev => new Map(prev).set(index, dimensions))
    }, []),
    preloadCount: settings.preloadPages
  })

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

        const pageUrls = pageFiles.map((file: string) => `${baseUrl}/data/${chapterHash}/${file}`)
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

  // Update reading history
  useEffect(() => {
    if (chapterInfo && totalPages > 0) {
      updateReadingHistory(mangaId, {
        chapterId,
        chapter: chapterInfo.attributes.chapter || 'Unknown',
        page: currentPage,
        totalPages,
        mangaTitle: `Chapter ${chapterInfo.attributes.chapter}`,
        posterUrl: ''
      })
    }
  }, [mangaId, chapterId, currentPage, totalPages, chapterInfo])

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
    
    // Add 3D flip animation
    const currentPageElement = pageRefs.current[currentPage - 1]
    const nextPageElement = pageRefs.current[page - 1]
    
    if (currentPageElement) {
      currentPageElement.style.transform = 'perspective(1000px) rotateY(-90deg)'
      currentPageElement.style.transition = 'transform 0.3s ease-in-out'
    }
    
    setTimeout(() => {
      setCurrentPage(page)
      
      if (nextPageElement) {
        nextPageElement.style.transform = 'perspective(1000px) rotateY(90deg)'
        nextPageElement.style.transition = 'none'
        
        setTimeout(() => {
          nextPageElement.style.transform = 'perspective(1000px) rotateY(0deg)'
          nextPageElement.style.transition = 'transform 0.3s ease-in-out'
        }, 50)
      }
      
      if (settings.soundEnabled) {
        playFlipSound()
      }
      
      // Update URL
      router.replace(`/reader/${mangaId}/${page}?chapter=${chapterId}`, { scroll: false })
      
      setTimeout(() => {
        setIsTransitioning(false)
        // Reset transforms
        if (currentPageElement) {
          currentPageElement.style.transform = ''
          currentPageElement.style.transition = ''
        }
        if (nextPageElement) {
          nextPageElement.style.transform = ''
          nextPageElement.style.transition = ''
        }
      }, 300)
    }, 150)
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

  const toggleUI = () => {
    setSettings(prev => ({ ...prev, showUI: !prev.showUI }))
  }

  // Render page content based on mode
  const renderPageContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <PageSkeleton width={800} height={1200} />
        </div>
      )
    }

    if (settings.readingMode === 'webtoon' || settings.readingMode === 'scroll-horizontal') {
      return (
        <div 
          ref={scrollContainerRef}
          className={`flex gap-4 p-4 overflow-auto h-full ${
            settings.readingMode === 'scroll-horizontal' ? 'flex-row' : 'flex-col'
          }`}
        >
          {pages.map((pageUrl, index) => {
            const dimensions = pageDimensions.get(index)
            const isLoaded = pageData[index]?.loaded

            return (
              <div 
                key={index} 
                ref={el => pageRefs.current[index] = el}
                className="flex-shrink-0 relative"
              >
                {isLoaded ? (
                  <div className="relative overflow-hidden rounded-lg shadow-2xl">
                    <Image
                      src={pageUrl}
                      alt={`Page ${index + 1}`}
                      width={dimensions?.width || 800}
                      height={dimensions?.height || 1200}
                      className="object-contain transition-transform duration-300 hover:scale-105"
                      style={{ 
                        userSelect: 'none',
                        WebkitUserSelect: 'none',
                        pointerEvents: 'none'
                      }}
                      unoptimized
                      draggable={false}
                    />
                  </div>
                ) : (
                  <PageSkeleton 
                    width={dimensions?.width || 800} 
                    height={dimensions?.height || 1200} 
                  />
                )}
              </div>
            )
          })}
        </div>
      )
    }

    if (settings.readingMode === 'double') {
      const currentPageData = pageData[currentPage - 1]
      const nextPageData = pageData[currentPage]
      
      return (
        <div className="flex items-center justify-center h-full">
          <div className="flex h-full max-h-[90vh] gap-2 perspective-1000">
            {/* Left Page */}
            <div 
              ref={el => pageRefs.current[currentPage - 1] = el}
              className="relative flex-shrink-0 transform-gpu transition-transform duration-300 hover:scale-105" 
              style={{ aspectRatio: '3/4' }}
            >
              {currentPageData?.loaded ? (
                <div className="relative w-full h-full overflow-hidden rounded-lg shadow-2xl">
                  <Image
                    src={pages[currentPage - 1]}
                    alt={`Page ${currentPage}`}
                    fill
                    className="object-contain"
                    style={{ 
                      userSelect: 'none',
                      WebkitUserSelect: 'none',
                      pointerEvents: 'none'
                    }}
                    priority
                    unoptimized
                    draggable={false}
                  />
                </div>
              ) : (
                <PageSkeleton width={600} height={800} />
              )}
            </div>
            
            {/* Right Page */}
            {currentPage < totalPages && (
              <div 
                ref={el => pageRefs.current[currentPage] = el}
                className="relative flex-shrink-0 transform-gpu transition-transform duration-300 hover:scale-105" 
                style={{ aspectRatio: '3/4' }}
              >
                {nextPageData?.loaded ? (
                  <div className="relative w-full h-full overflow-hidden rounded-lg shadow-2xl">
                    <Image
                      src={pages[currentPage]}
                      alt={`Page ${currentPage + 1}`}
                      fill
                      className="object-contain"
                      style={{ 
                        userSelect: 'none',
                        WebkitUserSelect: 'none',
                        pointerEvents: 'none'
                      }}
                      priority
                      unoptimized
                      draggable={false}
                    />
                  </div>
                ) : (
                  <PageSkeleton width={600} height={800} />
                )}
              </div>
            )}
          </div>
        </div>
      )
    }

    // Single page mode
    const currentPageData = pageData[currentPage - 1]
    const dimensions = pageDimensions.get(currentPage - 1)
    
    return (
      <div className="flex items-center justify-center h-full">
        {currentPageData?.loaded ? (
          <div 
            ref={el => pageRefs.current[currentPage - 1] = el}
            className="relative max-w-full max-h-full transform-gpu transition-all duration-300 hover:scale-105"
          >
            <div className="relative overflow-hidden rounded-lg shadow-2xl">
              <Image
                src={pages[currentPage - 1]}
                alt={`Page ${currentPage}`}
                width={dimensions?.width || 800}
                height={dimensions?.height || 1200}
                className="object-contain max-w-full max-h-[90vh]"
                style={{ 
                  zoom: `${settings.zoom}%`,
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  pointerEvents: 'none'
                }}
                priority
                unoptimized
                draggable={false}
              />
            </div>
          </div>
        ) : (
          <PageSkeleton 
            width={dimensions?.width || 800} 
            height={dimensions?.height || 1200} 
          />
        )}
      </div>
    )
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
          if (settings.readingMode === 'webtoon') {
            scrollContainerRef.current?.scrollBy(0, -200)
          } else {
            prevPage()
          }
          break
        case 'ArrowDown':
          e.preventDefault()
          if (settings.readingMode === 'webtoon') {
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
          toggleUI()
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <PageSkeleton width={800} height={1200} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <GestureHandler
        onNextPage={nextPage}
        onPrevPage={prevPage}
        onToggleUI={toggleUI}
        readingDirection={settings.flipDirection}
        className="h-screen"
      >
        <div ref={containerRef} className="relative w-full h-screen">
          {renderPageContent()}
        </div>
      </GestureHandler>

      {/* Top Navigation Bar */}
      {settings.showUI && (
        <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/90 to-transparent p-4 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push(`/manga/${mangaId}`)}
                className="text-white hover:bg-white/20 rounded-full"
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
              <Badge variant="secondary" className="bg-white/20 backdrop-blur-sm">
                {settings.readingMode.toUpperCase()}
              </Badge>
              
              {settings.autoPlay && (
                <Badge variant="secondary" className="bg-green-600/20 text-green-400 backdrop-blur-sm">
                  AUTO {settings.autoPlaySpeed}s
                </Badge>
              )}
              
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleUI}
                className="text-white hover:bg-white/20 rounded-full"
              >
                {settings.showUI ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSettings(!showSettings)}
                className="text-white hover:bg-white/20 rounded-full"
              >
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      {settings.showUI && (
        <div className="absolute bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black/90 to-transparent p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={prevChapter}
                disabled={currentChapterIndex === 0}
                className="text-white hover:bg-white/20 disabled:opacity-50 rounded-full"
              >
                <SkipBack className="w-5 h-5" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={prevPage}
                disabled={currentPage === 1 && currentChapterIndex === 0}
                className="text-white hover:bg-white/20 disabled:opacity-50 rounded-full"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleAutoPlay}
                className={`text-white hover:bg-white/20 rounded-full ${settings.autoPlay ? 'bg-green-600/20' : ''}`}
              >
                {settings.autoPlay ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </Button>

              <div className="text-center">
                <div className="text-sm text-gray-400">
                  {currentPage} / {totalPages}
                </div>
                <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-red-500 transition-all duration-300 rounded-full"
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
                className="text-white hover:bg-white/20 disabled:opacity-50 rounded-full"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={nextChapter}
                disabled={currentChapterIndex === allChapters.length - 1}
                className="text-white hover:bg-white/20 disabled:opacity-50 rounded-full"
              >
                <SkipForward className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
          <Card className="bg-gray-900/95 border-gray-700 p-6 max-w-md w-full max-h-[90vh] overflow-y-auto backdrop-blur-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Reader Settings</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-white rounded-full"
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
                    max={60}
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
                <div>• Tap sides to navigate, center to toggle UI</div>
                <div>• Hold and swipe to turn pages</div>
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

      <style jsx global>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-gpu {
          transform: translateZ(0);
        }
      `}</style>
    </div>
  )
}