'use client'

interface ProgressBarProps {
  progress: number
  color: string
  total: number
  current: number
}

export default function ProgressBar({ progress, color, total, current }: ProgressBarProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300 ease-out"
          style={{
            width: `${Math.max(3, progress)}%`,
            background: `linear-gradient(90deg, ${color}88, ${color})`,
          }}
        />
      </div>
      <span className="text-xs text-gray-500 whitespace-nowrap">
        {current} / {total}
      </span>
    </div>
  )
}
