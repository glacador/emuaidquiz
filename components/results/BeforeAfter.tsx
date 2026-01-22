'use client'

import Image from 'next/image'
import { Condition } from '@/config/schema'

interface BeforeAfterProps {
  condition: Condition
  brandColor: string
}

export default function BeforeAfter({ condition, brandColor }: BeforeAfterProps) {
  const imagePath = `/images/before-after/${condition.slug}.svg`

  return (
    <div className="px-5 py-6">
      <div className="text-center mb-4">
        <h3
          className="text-sm font-bold uppercase tracking-wide"
          style={{ color: brandColor }}
        >
          Your Transformation Journey
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          What&apos;s possible with the right approach
        </p>
      </div>
      <div className="relative rounded-xl overflow-hidden bg-white shadow-sm border border-gray-100">
        <Image
          src={imagePath}
          alt={`Before and after illustration for ${condition.name}`}
          width={320}
          height={160}
          className="w-full h-auto"
          priority
        />
      </div>
      <p className="text-xs text-gray-400 text-center mt-3 italic">
        Illustration represents typical results. Individual results may vary.
      </p>
    </div>
  )
}
