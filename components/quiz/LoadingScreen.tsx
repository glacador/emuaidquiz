'use client'

import { useState, useEffect } from 'react'

interface LoadingScreenProps {
  onComplete: () => void
  brandColor: string
}

const LOADING_MESSAGES = [
  'Reviewing your answers...',
  'Matching your pattern...',
  'Checking 847,000+ cases...',
  'Personalizing protocol...',
  'Almost ready...',
]

export default function LoadingScreen({ onComplete, brandColor }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.random() * 12 + 4
        if (next >= 100) {
          clearInterval(interval)
          setTimeout(() => onComplete(), 200)
          return 100
        }
        return next
      })
    }, 150)

    return () => clearInterval(interval)
  }, [onComplete])

  const getMessage = () => {
    if (progress < 20) return LOADING_MESSAGES[0]
    if (progress < 40) return LOADING_MESSAGES[1]
    if (progress < 60) return LOADING_MESSAGES[2]
    if (progress < 80) return LOADING_MESSAGES[3]
    return LOADING_MESSAGES[4]
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-12 animate-fadeIn">
      <p className="text-lg font-semibold text-gray-700 mb-6">
        {getMessage()}
      </p>

      <div className="w-full max-w-xs h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
        <div
          className="h-full rounded-full transition-all duration-150"
          style={{
            width: `${progress}%`,
            background: `linear-gradient(90deg, ${brandColor}88, ${brandColor})`,
          }}
        />
      </div>

      <p className="text-sm text-gray-400">
        {Math.round(progress)}%
      </p>
    </div>
  )
}
