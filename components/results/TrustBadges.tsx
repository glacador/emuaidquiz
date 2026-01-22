'use client'

import Image from 'next/image'
import { TrustBadge } from '@/config/schema'

interface TrustBadgesProps {
  badges: TrustBadge[]
}

export default function TrustBadges({ badges }: TrustBadgesProps) {
  return (
    <div className="py-4 px-5 overflow-x-auto">
      <p className="text-xs text-gray-400 text-center mb-3">As featured in:</p>
      <div className="flex items-center justify-center gap-4 min-w-max">
        {badges.map((badge) => (
          <div
            key={badge.name}
            className="opacity-60 hover:opacity-100 transition-opacity flex-shrink-0"
          >
            {badge.logo ? (
              <Image
                src={badge.logo}
                alt={badge.name}
                width={100}
                height={32}
                className="h-8 w-auto object-contain"
              />
            ) : (
              <span className="text-xs text-gray-400 font-medium">
                {badge.name}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
