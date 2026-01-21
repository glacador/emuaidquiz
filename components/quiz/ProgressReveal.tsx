'use client'

import { useState, useEffect } from 'react'
import { calculateDisplayScore } from '@/lib/scoring'

interface ProgressRevealProps {
  onComplete: () => void
  brandColor: string
  urgency: number
}

export default function ProgressReveal({
  onComplete,
  brandColor,
  urgency,
}: ProgressRevealProps) {
  const [revealed, setRevealed] = useState(false)
  const displayScore = calculateDisplayScore(urgency)

  useEffect(() => {
    const revealTimer = setTimeout(() => setRevealed(true), 800)
    const completeTimer = setTimeout(() => onComplete(), 3500)

    return () => {
      clearTimeout(revealTimer)
      clearTimeout(completeTimer)
    }
  }, [onComplete])

  const getMessage = () => {
    if (displayScore >= 90) return 'Excellent match — personalized recommendation ready'
    if (displayScore >= 82) return 'Strong match — we found your pattern'
    return 'Good match — we can help'
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-12 animate-fadeIn">
      <div className="text-4xl mb-4">✨</div>

      <p className="text-sm text-gray-400 mb-4">Your Match Score</p>

      {revealed ? (
        <>
          <div
            className="text-6xl font-bold mb-2 animate-scaleIn"
            style={{ color: brandColor }}
          >
            {displayScore}
          </div>
          <p className="text-sm text-gray-500 mb-6">out of 100</p>

          <div className="w-full max-w-xs h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${displayScore}%`,
                background: `linear-gradient(90deg, ${brandColor}88, ${brandColor})`,
              }}
            />
          </div>

          <p className="text-sm text-gray-600 max-w-xs">
            {getMessage()}
          </p>
        </>
      ) : (
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full animate-pulse"
              style={{
                backgroundColor: brandColor,
                animationDelay: `${i * 150}ms`,
              }}
            />
          ))}
        </div>
      )}

      <style jsx>{`
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scaleIn {
          animation: scaleIn 0.4s ease-out;
        }
      `}</style>
    </div>
  )
}
