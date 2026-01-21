'use client'

interface BeliefCardProps {
  icon: string
  stat?: string
  headline: string
  subtext: string
  brandColor: string
}

export default function BeliefCard({
  icon,
  stat,
  headline,
  subtext,
  brandColor,
}: BeliefCardProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-12 animate-fadeIn">
      <div
        className="text-5xl mb-6"
        style={{ animation: 'float 2.5s ease-in-out infinite' }}
      >
        {icon}
      </div>

      {stat && (
        <div
          className="text-5xl font-bold mb-3"
          style={{ color: brandColor }}
        >
          {stat}
        </div>
      )}

      <h3 className="text-xl font-semibold text-gray-800 mb-4 max-w-xs">
        {headline}
      </h3>

      <p className="text-sm text-gray-500 max-w-xs">
        {subtext}
      </p>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  )
}
