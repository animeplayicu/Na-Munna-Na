import { Suspense } from "react"
import SpotlightSection from "@/components/spotlight-section"
import ContinueReadingSection from "@/components/continue-reading-section"
import TrendingMangaSection from "@/components/trending-manga-section"
import RecentMangaSection from "@/components/recent-manga-section"
import LoadingSpinner from "@/components/loading-spinner"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 overflow-hidden">
      {/* Animated background particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10">
        <div className="container mx-auto px-4 py-8 space-y-20">
          <Suspense fallback={<LoadingSpinner />}>
            <SpotlightSection />
          </Suspense>
          <Suspense fallback={<LoadingSpinner />}>
            <ContinueReadingSection />
          </Suspense>
          <Suspense fallback={<LoadingSpinner />}>
            <TrendingMangaSection />
          </Suspense>
          <Suspense fallback={<LoadingSpinner />}>
            <RecentMangaSection />
          </Suspense>
        </div>
      </div>
    </div>
  )
}