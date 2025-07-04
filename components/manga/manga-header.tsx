'use client'

import Image from 'next/image'
import Link from 'next/link'
import {
  Star,
  Calendar,
  User,
  Book,
  BookOpen,
  Share2,
  Bookmark as BookmarkIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import LibraryStatusSelector from '@/components/library/library-status-selector'
import { useBookmark } from '@/hooks/useBookmark'
import { toast } from 'sonner'
import { KitsuManga, getBestKitsuTitle } from '@/lib/kitsu-api'
import { Chapter } from '@/lib/mangadx-api'

interface MangaHeaderProps {
  kitsuManga: KitsuManga | null
  mangaData: {
    manga_id: string
    manga_title: string
    manga_slug: string
    poster_url: string
    total_chapters: number | undefined
  }
  mangaSlug: string
  chapters: Chapter[]
}

export default function MangaHeader({ kitsuManga, mangaData, mangaSlug, chapters }: MangaHeaderProps) {
  const { isBookmarked, isLoading: isBookmarkLoading, toggleBookmark } = useBookmark(mangaData.manga_id)

  const posterUrl = mangaData.poster_url
  const title = mangaData.manga_title
  const authors = kitsuManga?.relationships?.staff?.data?.map((s: any) => s.attributes?.name || 'Unknown') || []

  const handleBookmarkToggle = async () => {
    const bookmarkData = {
      id: mangaData.manga_id,
      title: title,
      slug: mangaSlug,
      posterUrl: posterUrl,
      type: 'manga' as const,
    }
    const wasBookmarked = isBookmarked
    const success = await toggleBookmark(bookmarkData)
    if (success) {
      toast.success(wasBookmarked ? 'Bookmark removed' : 'Manga bookmarked')
    } else {
      toast.error('Failed to update bookmark')
    }
  }

  const firstChapterId = chapters[0]?.id

  return (
    <div className="space-y-6 max-w-sm mx-auto lg:mx-0">
      {/* Poster Image */}
      <div className="relative w-64 aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border-4 border-gray-800/80 mx-auto lg:mx-0">
        <Image 
          src={posterUrl || '/placeholder.svg'} 
          alt={title} 
          fill 
          className="object-cover" 
          unoptimized 
        />
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {firstChapterId && (
          <Button asChild className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg">
            <Link href={`/reader/${mangaSlug}/1?chapter=${firstChapterId}`}>
              <BookOpen className="w-4 h-4 mr-2" />
              Start Reading
            </Link>
          </Button>
        )}
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex-1 border-gray-600/50 hover:border-blue-500/50 text-gray-300 hover:text-blue-400 hover:bg-blue-500/10"
            onClick={handleBookmarkToggle}
            disabled={isBookmarkLoading}
          >
            <BookmarkIcon className={`w-4 h-4 mr-2 ${isBookmarked ? 'text-blue-400 fill-current' : 'text-gray-300'}`} />
            {isBookmarked ? 'Saved' : 'Save'}
          </Button>
          
          <Button 
            variant="outline" 
            className="flex-1 border-gray-600/50 hover:border-green-500/50 text-gray-300 hover:text-green-400 hover:bg-green-500/10"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: title,
                  text: `Check out ${title} on AniReads!`,
                  url: window.location.href
                })
              } else {
                navigator.clipboard.writeText(window.location.href)
                toast.success('Link copied to clipboard!')
              }
            }}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>

        <LibraryStatusSelector mangaData={mangaData} onStatusChange={() => {}} />
      </div>
    </div>
  )
}