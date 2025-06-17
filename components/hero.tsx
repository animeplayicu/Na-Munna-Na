"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Search, BookOpen, TrendingUp, Star, Sparkles, Zap, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"

export default function Hero() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isVisible, setIsVisible] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleStartReading = () => {
    router.push('/home')
  }

  const handleBrowseFavorites = () => {
    router.push('/favorites')
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-red-900/30 via-black to-purple-900/30 min-h-screen flex items-center">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-2 h-2 bg-red-400 rounded-full animate-ping"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-blue-400 rounded-full animate-ping delay-1000"></div>
        <div className="absolute bottom-32 left-1/4 w-1.5 h-1.5 bg-purple-400 rounded-full animate-ping delay-2000"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-yellow-400 rounded-full animate-ping delay-3000"></div>
        
        {/* Floating manga panels */}
        <div className="absolute top-20 right-10 w-16 h-20 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg opacity-20 animate-float"></div>
        <div className="absolute bottom-40 left-20 w-12 h-16 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg opacity-15 animate-float delay-1000"></div>
        <div className="absolute top-1/2 left-10 w-10 h-14 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg opacity-10 animate-float delay-2000"></div>
      </div>

      <div className="relative container mx-auto px-4 py-24">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          <div className={`space-y-6 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Main title with enhanced animations */}
            <div className="relative">
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-black bg-gradient-to-r from-red-500 via-orange-500 to-red-600 bg-clip-text text-transparent animate-pulse">
                AniReads
              </h1>
              <div className="absolute -top-4 -right-4 text-yellow-400 animate-bounce">
                <Sparkles className="w-8 h-8 md:w-12 md:h-12" />
              </div>
              <div className="absolute -bottom-2 -left-2 text-blue-400 animate-bounce delay-500">
                <Zap className="w-6 h-6 md:w-8 md:h-8" />
              </div>
            </div>

            <div className="relative">
              <p className="text-xl md:text-3xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Discover, read, and immerse yourself in the world's most captivating manga collection
              </p>
              <div className="absolute -top-2 right-0 text-red-400 animate-pulse">
                <Heart className="w-5 h-5 fill-current" />
              </div>
            </div>
          </div>

          {/* Enhanced search bar */}
          <form onSubmit={handleSearch} className={`max-w-3xl mx-auto transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-orange-500 to-red-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
              <div className="relative bg-gray-900/90 backdrop-blur-xl rounded-2xl p-2 border border-gray-700/50">
                <div className="flex items-center">
                  <Search className="absolute left-6 text-gray-400 w-6 h-6 z-10" />
                  <Input
                    type="text"
                    placeholder="Search for manga titles, authors, or genres..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-16 pr-4 py-6 text-xl bg-transparent border-none focus:ring-0 text-white placeholder:text-gray-400 rounded-xl"
                  />
                  <Button
                    type="submit"
                    className="mr-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 rounded-xl px-8 py-6 text-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/25"
                  >
                    Search
                  </Button>
                </div>
              </div>
            </div>
          </form>

          {/* Enhanced feature highlights */}
          <div className={`flex flex-wrap justify-center gap-6 pt-12 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {[
              { icon: BookOpen, text: "10,000+ Manga", color: "from-blue-500 to-cyan-500" },
              { icon: TrendingUp, text: "Daily Updates", color: "from-green-500 to-emerald-500" },
              { icon: Star, text: "HD Quality", color: "from-yellow-500 to-orange-500" }
            ].map((feature, index) => (
              <div
                key={feature.text}
                className={`group relative transition-all duration-500 delay-${index * 100} hover:scale-110`}
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300`}></div>
                <div className="relative flex items-center gap-3 bg-gray-900/90 backdrop-blur-xl rounded-2xl px-6 py-4 border border-gray-700/30 hover:border-gray-600/50 transition-all duration-300">
                  <feature.icon className="w-6 h-6 text-white" />
                  <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                    {feature.text}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Call to action */}
          <div className={`pt-8 transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <p className="text-gray-400 text-lg mb-6">Join thousands of manga enthusiasts worldwide</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                onClick={handleStartReading}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25"
              >
                Start Reading Now
              </Button>
              <Button
                variant="outline"
                onClick={handleBrowseFavorites}
                className="border-gray-600 text-gray-300 hover:border-gray-500 hover:text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
              >
                Browse Favorites
              </Button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes tilt {
          0%, 50%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(1deg); }
          75% { transform: rotate(-1deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-tilt {
          animation: tilt 10s infinite linear;
        }
      `}</style>
    </div>
  )
}