'use client'

interface PageSkeletonProps {
  width?: number
  height?: number
  className?: string
}

export default function PageSkeleton({ width, height, className = '' }: PageSkeletonProps) {
  const aspectRatio = width && height ? width / height : 3/4

  return (
    <div 
      className={`relative bg-gray-800 rounded-lg overflow-hidden shadow-xl animate-pulse ${className}`}
      style={{ 
        aspectRatio,
        width: width ? `${Math.min(width, 800)}px` : '100%',
        height: height ? `${Math.min(height, 1200)}px` : 'auto',
        maxWidth: '100%',
        maxHeight: '100vh'
      }}
    >
      <style jsx global>{`
        @keyframes manga-shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .manga-shimmer {
          background: linear-gradient(90deg, #374151 8%, #4b5563 18%, #374151 33%);
          background-size: 200% 100%;
          animation: manga-shimmer 2s infinite linear;
        }
      `}</style>
      
      <div className="h-full flex flex-col p-4 gap-4">
        {/* Header area */}
        <div className="flex justify-between items-center">
          <div className="h-6 w-24 manga-shimmer rounded"></div>
          <div className="h-6 w-16 manga-shimmer rounded"></div>
        </div>
        
        {/* Main content area */}
        <div className="flex-1 relative">
          <div className="absolute inset-0 manga-shimmer rounded-lg"></div>
          
          {/* Manga panel lines */}
          <div className="absolute inset-4 space-y-3">
            <div className="h-4 manga-shimmer rounded w-3/4"></div>
            <div className="h-4 manga-shimmer rounded w-1/2"></div>
            <div className="h-4 manga-shimmer rounded w-2/3"></div>
            
            <div className="mt-8 space-y-2">
              <div className="h-3 manga-shimmer rounded w-full"></div>
              <div className="h-3 manga-shimmer rounded w-5/6"></div>
              <div className="h-3 manga-shimmer rounded w-4/5"></div>
            </div>
          </div>
          
          {/* Speech bubble placeholders */}
          <div className="absolute top-8 right-8 w-20 h-12 manga-shimmer rounded-full"></div>
          <div className="absolute bottom-16 left-8 w-24 h-8 manga-shimmer rounded-lg"></div>
        </div>
        
        {/* Footer area */}
        <div className="flex justify-center">
          <div className="h-4 w-32 manga-shimmer rounded"></div>
        </div>
      </div>
    </div>
  )
}