'use client'

interface PageSkeletonProps {
  width?: number
  height?: number
  className?: string
}

export default function PageSkeleton({ width = 800, height = 1200, className = '' }: PageSkeletonProps) {
  return (
    <div 
      className={`relative bg-white border-2 border-gray-300 rounded-lg overflow-hidden shadow-2xl ${className}`}
      style={{ 
        width: `${Math.min(width * 0.6, 480)}px`,
        height: `${Math.min(height * 0.6, 720)}px`,
        maxWidth: '90vw',
        maxHeight: '85vh'
      }}
    >
      <style jsx global>{`
        @keyframes manga-pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        @keyframes text-shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes bubble-float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-5px) scale(1.05); }
        }
        .manga-panel {
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%);
          animation: manga-pulse 3s ease-in-out infinite;
          position: relative;
          overflow: hidden;
        }
        .manga-panel::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent);
          animation: text-shimmer 2s infinite;
        }
        .manga-text-line {
          background: linear-gradient(90deg, #cbd5e1 0%, #94a3b8 50%, #cbd5e1 100%);
          animation: manga-pulse 2.5s ease-in-out infinite;
          position: relative;
          overflow: hidden;
        }
        .manga-text-line::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent);
          animation: text-shimmer 2.5s infinite;
        }
        .manga-bubble {
          background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 50%, #e2e8f0 100%);
          animation: bubble-float 2s ease-in-out infinite;
          position: relative;
          overflow: hidden;
        }
        .manga-bubble::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent);
          animation: text-shimmer 3s infinite;
        }
        .manga-character {
          background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 50%, #f8fafc 100%);
          animation: manga-pulse 2.8s ease-in-out infinite;
          position: relative;
          overflow: hidden;
        }
        .manga-character::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent);
          animation: text-shimmer 2.8s infinite;
        }
        .action-line {
          background: linear-gradient(90deg, #94a3b8 0%, #64748b 50%, #94a3b8 100%);
          animation: manga-pulse 1.8s ease-in-out infinite;
          transform-origin: left center;
        }
        .panel-border {
          border: 2px solid #64748b;
          border-radius: 8px;
          position: relative;
        }
        .panel-border::after {
          content: '';
          position: absolute;
          inset: -2px;
          border: 2px solid transparent;
          border-radius: 8px;
          background: linear-gradient(45deg, #3b82f6, #8b5cf6, #ef4444, #f59e0b) border-box;
          mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
          mask-composite: exclude;
          opacity: 0.3;
          animation: manga-pulse 4s ease-in-out infinite;
        }
      `}</style>
      
      {/* Manga Page Layout */}
      <div className="h-full flex flex-col p-4 bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Top Panel - Main scene */}
        <div className="h-2/5 manga-panel rounded-lg mb-3 panel-border relative">
          {/* Main character silhouette */}
          <div className="absolute bottom-3 left-3 w-20 h-24 manga-character rounded-lg"></div>
          <div className="absolute bottom-3 right-3 w-16 h-20 manga-character rounded-lg"></div>
          
          {/* Speech Bubbles */}
          <div className="absolute top-3 right-3 w-20 h-12 manga-bubble rounded-full"></div>
          <div className="absolute top-3 left-1/3 w-16 h-10 manga-bubble rounded-full"></div>
          
          {/* Background elements */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-16 manga-panel rounded-lg opacity-30"></div>
        </div>
        
        {/* Middle Panels Row */}
        <div className="h-1/3 flex gap-3 mb-3">
          {/* Left panel - Close-up */}
          <div className="flex-1 manga-panel rounded-lg panel-border relative">
            {/* Character close-up */}
            <div className="absolute inset-2 manga-character rounded-lg"></div>
            {/* Thought bubble */}
            <div className="absolute top-2 right-2 w-12 h-8 manga-bubble rounded-full"></div>
            {/* Text lines */}
            <div className="absolute bottom-2 left-2 right-2 space-y-1">
              <div className="h-1.5 manga-text-line rounded w-3/4"></div>
              <div className="h-1.5 manga-text-line rounded w-1/2"></div>
            </div>
          </div>
          
          {/* Right panel - Action scene */}
          <div className="flex-1 manga-panel rounded-lg panel-border relative">
            {/* Action lines */}
            <div className="absolute inset-2 space-y-1">
              <div className="h-1 action-line rounded w-full transform rotate-12 opacity-60"></div>
              <div className="h-1 action-line rounded w-4/5 transform -rotate-6 opacity-70"></div>
              <div className="h-1 action-line rounded w-3/5 transform rotate-3 opacity-80"></div>
              <div className="h-1 action-line rounded w-2/3 transform -rotate-12 opacity-50"></div>
            </div>
            {/* Impact effect */}
            <div className="absolute center-center w-8 h-8 manga-bubble rounded-full"></div>
          </div>
        </div>
        
        {/* Bottom Panel - Dialogue scene */}
        <div className="h-1/4 manga-panel rounded-lg panel-border relative">
          {/* Multiple characters */}
          <div className="absolute bottom-2 left-2 w-10 h-12 manga-character rounded-lg"></div>
          <div className="absolute bottom-2 left-16 w-8 h-10 manga-character rounded-lg"></div>
          <div className="absolute bottom-2 right-2 w-12 h-14 manga-character rounded-lg"></div>
          
          {/* Speech bubbles */}
          <div className="absolute top-2 left-2 w-16 h-8 manga-bubble rounded-full"></div>
          <div className="absolute top-2 right-2 w-18 h-6 manga-bubble rounded-full"></div>
          
          {/* Dialogue text */}
          <div className="absolute bottom-2 left-1/4 right-1/4 space-y-1">
            <div className="h-1.5 manga-text-line rounded w-full"></div>
            <div className="h-1.5 manga-text-line rounded w-4/5"></div>
          </div>
        </div>
      </div>
      
      {/* Page border effect with manga-style decoration */}
      <div className="absolute inset-0 border-4 border-gray-400 rounded-lg pointer-events-none"></div>
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-gray-400 to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-gray-400 to-transparent"></div>
      
      {/* Page number */}
      <div className="absolute bottom-2 right-2 text-xs text-gray-500 font-mono bg-white/80 px-2 py-1 rounded">
        Loading...
      </div>
      
      {/* Manga-style corner decoration */}
      <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-gray-400"></div>
      <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-gray-400"></div>
      <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-gray-400"></div>
      <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-gray-400"></div>
    </div>
  )
}