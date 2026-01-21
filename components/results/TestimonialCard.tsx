'use client'

import { Condition } from '@/config/schema'

interface TestimonialCardProps {
  condition: Condition
  brandColor: string
}

// Default testimonials per condition type
const TESTIMONIALS: Record<string, { name: string; location: string; quote: string }> = {
  default: {
    name: 'Sarah M.',
    location: 'Portland, OR',
    quote: 'After trying so many products that didn\'t work, I finally found something that actually makes a difference. Within 3 weeks, my skin looked better than it had in years.',
  },
  inflammatory: {
    name: 'Jennifer L.',
    location: 'Seattle, WA',
    quote: 'The redness and inflammation that I\'d been dealing with for months started calming down within the first two weeks. I wish I\'d found this sooner.',
  },
  cystic: {
    name: 'Michael R.',
    location: 'Austin, TX',
    quote: 'Deep, painful acne was ruining my confidence. This is the first thing that actually helped reduce both the pain and the size of new breakouts.',
  },
  hormonal: {
    name: 'Amanda K.',
    location: 'Denver, CO',
    quote: 'My jawline acne that always flared up every month has significantly reduced. Finally something that understands hormonal patterns!',
  },
  fungal: {
    name: 'David P.',
    location: 'San Diego, CA',
    quote: 'I spent 2 years treating what I thought was acne. Turns out it was fungal. Within 3 weeks of the right approach, my skin was clearer than ever.',
  },
  rosacea: {
    name: 'Linda H.',
    location: 'Phoenix, AZ',
    quote: 'After being told my rosacea was "just something I\'d have to live with," I found real relief. The redness and flushing have reduced dramatically.',
  },
}

export default function TestimonialCard({ condition, brandColor }: TestimonialCardProps) {
  const testimonial = TESTIMONIALS[condition.slug] || TESTIMONIALS.default

  return (
    <div className="px-5 py-6">
      <div
        className="p-5 rounded-xl"
        style={{ backgroundColor: `${brandColor}08` }}
      >
        <div className="flex items-center gap-1 mb-3">
          {[1, 2, 3, 4, 5].map((star) => (
            <span key={star} className="text-yellow-400 text-lg">★</span>
          ))}
        </div>

        <blockquote className="text-gray-700 text-sm leading-relaxed mb-4 italic">
          &ldquo;{testimonial.quote}&rdquo;
        </blockquote>

        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: brandColor }}
          >
            {testimonial.name.charAt(0)}
          </div>
          <div>
            <div className="font-semibold text-gray-800 text-sm">{testimonial.name}</div>
            <div className="text-xs text-gray-500">{testimonial.location}</div>
          </div>
          <div className="ml-auto">
            <span
              className="text-xs px-2 py-1 rounded-full"
              style={{
                backgroundColor: `${brandColor}15`,
                color: brandColor,
              }}
            >
              Verified Buyer
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
