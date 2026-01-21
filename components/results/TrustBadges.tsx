'use client'

import { TrustBadge } from '@/config/schema'

interface TrustBadgesProps {
  badges: TrustBadge[]
}

export default function TrustBadges({ badges }: TrustBadgesProps) {
  return (
    <div className="py-4 px-5 overflow-x-auto">
      <p className="text-xs text-gray-400 text-center mb-3">As featured in:</p>
      <div className="flex items-center justify-center gap-6 min-w-max">
        {badges.map((badge) => (
          <div
            key={badge.name}
            className="text-xs text-gray-400 font-medium opacity-60 hover:opacity-100 transition-opacity"
          >
            {badge.name}
          </div>
        ))}
      </div>
    </div>
  )
}
