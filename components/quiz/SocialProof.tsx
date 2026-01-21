'use client'

interface SocialProofProps {
  name: string
  location: string
  pattern: string
  quote: string
  timeAgo: string
}

export default function SocialProof({
  name,
  location,
  pattern,
  quote,
  timeAgo,
}: SocialProofProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-12 animate-fadeIn">
      <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
        ✓ Just completed
      </div>

      <blockquote className="text-lg italic text-gray-700 mb-6 max-w-xs">
        &ldquo;{quote}&rdquo;
      </blockquote>

      <div className="font-semibold text-gray-600">
        — {name}, {location}
      </div>

      <div className="text-sm text-gray-400 mt-2">
        {pattern} • {timeAgo}
      </div>
    </div>
  )
}
