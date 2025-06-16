'use client'

interface PageSkeletonProps {
  width?: number
  height?: number
  className?: string
}

export default function PageSkeleton({ width = 800, height = 1200, className = '' }: PageSkeletonProps) {
  return (
    <div 
      className={`relative bg-white border-2 border-gray-300 rounded-lg overflow-hidden shadow-lg ${className}`}
      style={{ 
        width: `${Math.min(width * 0.6, 480)}px`,
        height: `${Math.min(height * 0.6, 720)}px`,
        maxWidth: '90vw',
        maxHeight: '85vh'
      }}
    >
      <style jsx global>{`
        @keyframes manga-pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        .manga-panel {
          background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%);
          animation: manga-pulse 2s ease-in-out infinite;
        }
        .manga-text-line {
          background: linear-gradient(90deg, #d1d5db 0%, #9ca3af 50%, #d1d5db 100%);
          animation: manga-pulse 2s ease-in-out infinite;
          animation-delay: 0.3s;
        }
        .manga-bubble {
          background: linear-gradient(135deg, #e5e7eb 0%, #d1d5db 50%, #e5e7eb 100%);
          animation: manga-pulse 2s ease-in-out infinite;
          animation-delay: 0.6s;
        }
      `}</style>
      
      {/* Manga Page Layout */}
      <div className="h-full flex flex-col p-4">
        {/* Top Panel */}
        <div className="h-1/3 manga-panel rounded-lg mb-3 relative">
          {/* Speech Bubble */}
          <div className="absolute top-2 right-2 w-16 h-8 manga-bubble rounded-full"></div>
          {/* Character outline */}
          <div className="absolute bottom-2 left-2 w-12 h-16 manga-panel rounded-lg opacity-50"></div>
        </div>
        
        {/* Middle Panels Row */}
        <div className="h-1/3 flex gap-2 mb-3">
          <div className="flex-1 manga-panel rounded-lg relative">
            {/* Text lines */}
            <div className="absolute top-2 left-2 right-2 space-y-1">
              <div className="h-2 manga-text-line rounded w-3/4"></div>
              <div className="h-2 manga-text-line rounded w-1/2"></div>
            </div>
          </div>
          <div className="flex-1 manga-panel rounded-lg relative">
            {/* Action lines */}
            <div className="absolute inset-2">
              <div className="h-1 manga-text-line rounded w-full mb-1 transform rotate-12"></div>
              <div className="h-1 manga-text-line rounded w-4/5 mb-1 transform -rotate-6"></div>
              <div className="h-1 manga-text-line rounded w-3/5 transform rotate-3"></div>
            </div>
          </div>
        </div>
        
        {/* Bottom Panel */}
        <div className="h-1/3 manga-panel rounded-lg relative">
          {/* Multiple speech bubbles */}
          <div className="absolute top-2 left-2 w-12 h-6 manga-bubble rounded-full"></div>
          <div className="absolute top-2 right-2 w-14 h-5 manga-bubble rounded-full"></div>
          {/* Text block */}
          <div className="absolute bottom-2 left-2 right-2 space-y-1">
            <div className="h-2 manga-text-line rounded w-full"></div>
            <div className="h-2 manga-text-line rounded w-4/5"></div>
            <div className="h-2 manga-text-line rounded w-3/5"></div>
          </div>
        </div>
      </div>
      
      {/* Page border effect */}
      <div className="absolute inset-0 border-2 border-gray-400 rounded-lg pointer-events-none"></div>
      
      {/* Loading indicator */}
      <div className="absolute top-2 left-2 text-xs text-gray-500 font-mono">
        Loading...
      </div>
    </div>
  )
}