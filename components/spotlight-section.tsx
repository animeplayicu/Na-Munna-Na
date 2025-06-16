"use client"

import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight, Star, BookOpen, Calendar, Play, Sparkles, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"
import { getMangaDxTrendingWithKitsuPosters } from "@/lib/mangadx-api"

export default function SpotlightSection() {
  const [spotlightManga, setSpotlightManga] = useState<any[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    const fetchSpotlightManga = async () => {
      try {
        const data = await getMangaDxTrendingWithKitsuPosters(10)
        setSpotlightManga(data || [])
      } catch (error) {
        console.error("Error fetching spotlight manga:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSpotlightManga()
  }, [])

  // Auto-rotate spotlight every 8 seconds
  useEffect(() => {
    if (spotlightManga.length > 0) {
      const interval = setInterval(() => {
        nextSlide()
      }, 8000)
      return () => clearInterval(interval)
    }
  }, [spotlightManga.length, currentIndex])

  const nextSlide = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrentIndex((prev) => (prev + 1) % spotlightManga.length)
    setTimeout(() => setIsAnimating(false), 500)
  }

  const prevSlide = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrentIndex((prev) => (prev - 1 + spotlightManga.length) % spotlightManga.length)
    setTimeout(() => setIsAnimating(false), 500)
  }

  if (loading) {
    return (
      <div className="relative h-[80vh] bg-gradient-to-r from-gray-900 via-black to-gray-900 rounded-3xl overflow-hidden animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-700" />
        <div className="absolute bottom-8 left-8 space-y-4">
          <div className="h-12 bg-gray-700 rounded w-80" />
          <div className="h-6 bg-gray-700 rounded w-96" />
          <div className="h-16 bg-gray-700 rounded w-40" />
        </div>
      </div>
    )
  }

  if (spotlightManga.length === 0) {
    return null
  }

  const currentManga = spotlightManga[currentIndex]
  const title = currentManga.attributes.title.en || Object.values(currentManga.attributes.title)[0] || "Unknown Title"
  const description = currentManga.attributes.description?.en || Object.values(currentManga.attributes.description)[0] || "No description available."
  
  // Enhanced image handling - use cover first, then poster as fallback
  const coverArt = currentManga.relationships.find((rel: any) => rel.type === 'cover_art' && rel.attributes?.fileName)
  const coverUrl = coverArt ? `https://uploads.mangadx.org/covers/${currentManga.id}/${coverArt.attributes?.fileName}.512.jpg` : null
  const posterUrl = currentManga.kitsuPoster
  
  // Use cover as banner, poster as side image
  const bannerUrl = coverUrl || posterUrl || "/placeholder.svg?height=600&width=1200"
  const sideImageUrl = posterUrl || coverUrl || "/placeholder.svg"
  
  const genres: string[] = Array.isArray(currentManga.attributes.tags)
    ? currentManga.attributes.tags
        .filter((tag: any) => tag.attributes.group === "genre")
        .map((tag: any) => tag?.attributes?.name?.en || Object.values(tag?.attributes?.name || {})[0] || '')
        .filter(Boolean)
        .slice(0, 4)
    : [];
  const contentRating = currentManga.attributes.contentRating

  return (
    <section className="relative h-[80vh] rounded-3xl overflow-hidden group shadow-2xl shadow-red-900/50">
      {/* Enhanced Background with better scaling */}
      <div className="absolute inset-0">
        <Image
          src={bannerUrl}
          alt={`${title} banner`}
          fill
          className={`object-cover transition-all duration-1000 group-hover:scale-105 ${
            coverUrl ? 'object-center' : 'object-top'
          }`}
          style={{
            objectPosition: coverUrl ? 'center center' : 'center top'
          }}
          unoptimized
          priority
        />
        {/* Enhanced gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-transparent to-purple-900/20" />
      </div>

      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-2 h-2 bg-red-400 rounded-full animate-ping opacity-60"></div>
        <div className="absolute top-40 right-32 w-1 h-1 bg-yellow-400 rounded-full animate-ping delay-1000 opacity-40"></div>
        <div className="absolute bottom-32 left-1/3 w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping delay-2000 opacity-50"></div>
      </div>

      {/* Content */}
      <div className="relative h-full flex items-end">
        <div className="container mx-auto px-8 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-end">
            {/* Enhanced Poster with better styling */}
            <div className="hidden lg:block">
              <div className="relative w-72 aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20 backdrop-blur-sm transform hover:scale-105 transition-all duration-500">
                <Image 
                  src={sideImageUrl} 
                  alt={title} 
                  fill 
                  className="object-cover" 
                  unoptimized 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                
                {/* Floating badge */}
                <div className="absolute top-4 left-4">
                  <Badge className="bg-red-600/90 text-white px-3 py-1 backdrop-blur-sm">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Featured
                  </Badge>
                </div>
              </div>
            </div>

            {/* Enhanced Main Content */}
            <div className="lg:col-span-3 space-y-8 text-white">
              <div className="space-y-6">
                {/* Enhanced header badges */}
                <div className="flex items-center gap-4 flex-wrap">
                  <Badge className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-4 py-2 text-sm font-semibold">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Spotlight
                  </Badge>
                  {currentManga.attributes.averageRating && (
                    <div className="flex items-center gap-2 bg-yellow-500/20 border border-yellow-500/30 rounded-full px-4 py-2 backdrop-blur-sm">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-yellow-100 font-semibold">
                        {Number.parseFloat(currentManga.attributes.averageRating).toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Enhanced title with animation */}
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-tight bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent drop-shadow-2xl animate-fade-in">
                  {title}
                </h1>

                {/* Enhanced genre tags */}
                <div className="flex flex-wrap gap-3">
                  {genres.slice(0, 4).map((genre, index) => (
                    <Badge
                      key={genre}
                      variant="secondary"
                      className="bg-white/10 text-white border-white/20 hover:bg-white/20 transition-all duration-300 px-4 py-2 backdrop-blur-sm"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {genre}
                    </Badge>
                  ))}
                </div>

                {/* Enhanced description */}
                <p className="text-xl text-gray-200 leading-relaxed max-w-4xl line-clamp-3 drop-shadow-lg">
                  {description}
                </p>

                {/* Enhanced metadata */}
                <div className="flex items-center gap-8 text-gray-300 flex-wrap">
                  <div className="flex items-center gap-3 bg-black/30 rounded-full px-4 py-2 backdrop-blur-sm">
                    <BookOpen className="w-5 h-5 text-red-400" />
                    <span className="font-medium">
                      {typeof currentManga.attributes.chapterCount === 'number' ? currentManga.attributes.chapterCount : "?"} Chapters
                    </span>
                  </div>
                  <div className="flex items-center gap-3 bg-black/30 rounded-full px-4 py-2 backdrop-blur-sm">
                    <Calendar className="w-5 h-5 text-blue-400" />
                    <span className="font-medium">
                      {currentManga.attributes.year || "Unknown"}
                    </span>
                  </div>
                  <Badge 
                    className={`px-4 py-2 font-semibold ${
                      currentManga.attributes.status === 'ongoing' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                      currentManga.attributes.status === 'completed' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                      'bg-gray-500/20 text-gray-300 border-gray-500/30'
                    }`}
                  >
                    {currentManga.attributes.status?.charAt(0).toUpperCase() + currentManga.attributes.status?.slice(1) || "Unknown"}
                  </Badge>
                  {contentRating && (
                    <Badge 
                      className={`px-4 py-2 font-semibold ${
                        contentRating.toLowerCase() === 'safe' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                        contentRating.toLowerCase() === 'suggestive' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                        'bg-red-500/20 text-red-300 border-red-500/30'
                      }`}
                    >
                      {contentRating.toUpperCase()}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Enhanced action buttons */}
              <div className="flex flex-wrap gap-6">
                <Link href={`/manga/${currentManga.id}`}>
                  <Button className="bg-gradient-to-r from-red-600 via-red-500 to-orange-500 hover:from-red-700 hover:via-red-600 hover:to-orange-600 text-white px-10 py-4 text-xl font-bold rounded-2xl shadow-2xl hover:shadow-red-500/50 transition-all duration-300 hover:scale-105 transform">
                    <Play className="w-6 h-6 mr-3" />
                    Read Now
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 hover:border-white/50 px-8 py-4 text-lg rounded-2xl backdrop-blur-sm shadow-xl hover:shadow-white/20 transition-all duration-300 hover:scale-105"
                >
                  Add to Library
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Navigation Controls */}
      <div className="absolute top-1/2 left-6 transform -translate-y-1/2">
        <Button
          variant="ghost"
          size="icon"
          onClick={prevSlide}
          className="bg-black/40 hover:bg-black/60 text-white border border-white/20 rounded-full backdrop-blur-sm shadow-xl hover:shadow-2xl w-14 h-14 transition-all duration-300 hover:scale-110"
        >
          <ChevronLeft className="w-7 h-7" />
        </Button>
      </div>
      <div className="absolute top-1/2 right-6 transform -translate-y-1/2">
        <Button
          variant="ghost"
          size="icon"
          onClick={nextSlide}
          className="bg-black/40 hover:bg-black/60 text-white border border-white/20 rounded-full backdrop-blur-sm shadow-xl hover:shadow-2xl w-14 h-14 transition-all duration-300 hover:scale-110"
        >
          <ChevronRight className="w-7 h-7" />
        </Button>
      </div>

      {/* Enhanced Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
        <div className="flex gap-3">
          {spotlightManga.map((_, index) => (
            <button
              key={index}
              onClick={() => !isAnimating && setCurrentIndex(index)}
              className={`transition-all duration-500 rounded-full ${
                index === currentIndex 
                  ? "bg-red-500 w-12 h-4 shadow-lg shadow-red-500/50" 
                  : "bg-white/30 hover:bg-white/50 w-4 h-4 hover:scale-125"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Enhanced Slide Counter */}
      <div className="absolute top-6 right-6">
        <div className="bg-black/50 backdrop-blur-sm rounded-2xl px-4 py-2 text-white text-sm font-medium border border-white/20">
          {currentIndex + 1} / {spotlightManga.length}
        </div>
      </div>
    </section>
  )
}