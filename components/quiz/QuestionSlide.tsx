'use client'

import { QuestionSlideType } from '@/config/schema'

interface QuestionSlideProps {
  question: QuestionSlideType
  answer?: string
  multiAnswer?: string[]
  onAnswer: (questionId: string, value: string, isMulti?: boolean) => void
  onMultiContinue: () => void
  brandColor: string
}

export default function QuestionSlide({
  question,
  answer,
  multiAnswer = [],
  onAnswer,
  onMultiContinue,
  brandColor,
}: QuestionSlideProps) {
  const hasSelection = !!answer || multiAnswer.length > 0

  if (question.type === 'image-grid') {
    const imageOptions = question.options.filter(o => o.imageKey)
    const textOptions = question.options.filter(o => !o.imageKey)

    return (
      <div className="animate-fadeIn">
        <h2 className="text-xl font-semibold text-gray-900 mb-2 leading-tight">
          {question.title}
        </h2>
        {question.subtitle && (
          <p className="text-sm text-gray-500 mb-3">{question.subtitle}</p>
        )}
        {question.helpText && (
          <p className="text-xs text-gray-400 italic mb-4">{question.helpText}</p>
        )}

        <div className="grid grid-cols-2 gap-3 mb-3">
          {imageOptions.map((option, idx) => {
            const isSelected = answer === option.value
            const isFaded = hasSelection && !isSelected

            return (
              <button
                key={option.value}
                onClick={() => onAnswer(question.id, option.value)}
                className="relative rounded-xl overflow-hidden border-2 transition-all duration-200"
                style={{
                  borderColor: isSelected ? brandColor : '#e5e5e5',
                  opacity: isFaded ? 0.5 : 1,
                  animationDelay: `${idx * 50}ms`,
                }}
              >
                <div
                  className="w-full h-20 bg-gray-100 flex items-center justify-center text-3xl"
                  style={{ backgroundColor: `${brandColor}15` }}
                >
                  {option.emoji || '📷'}
                </div>
                <div className="p-2 text-center">
                  <div className="text-sm font-medium text-gray-800">{option.label}</div>
                  {option.sublabel && (
                    <div className="text-xs text-gray-500">{option.sublabel}</div>
                  )}
                </div>
                {isSelected && (
                  <div
                    className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: brandColor }}
                  >
                    ✓
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {textOptions.map((option) => {
          const isSelected = answer === option.value
          const isFaded = hasSelection && !isSelected

          return (
            <button
              key={option.value}
              onClick={() => onAnswer(question.id, option.value)}
              className="w-full p-3 rounded-xl border-2 text-left transition-all duration-200 mb-2"
              style={{
                borderColor: isSelected ? brandColor : '#e5e5e5',
                backgroundColor: isSelected ? `${brandColor}10` : 'white',
                opacity: isFaded ? 0.5 : 1,
              }}
            >
              <span className="font-medium text-gray-800">{option.label}</span>
              {isSelected && (
                <span className="float-right font-bold" style={{ color: brandColor }}>✓</span>
              )}
            </button>
          )
        })}
      </div>
    )
  }

  if (question.type === 'multi') {
    return (
      <div className="animate-fadeIn">
        <h2 className="text-xl font-semibold text-gray-900 mb-2 leading-tight">
          {question.title}
        </h2>
        {question.subtitle && (
          <p className="text-sm text-gray-500 mb-4">{question.subtitle}</p>
        )}

        <div className="space-y-2">
          {question.options.map((option, idx) => {
            const isSelected = multiAnswer.includes(option.value)

            return (
              <button
                key={option.value}
                onClick={() => onAnswer(question.id, option.value, true)}
                className="w-full p-4 rounded-xl border-2 text-left transition-all duration-200 flex items-center gap-3"
                style={{
                  borderColor: isSelected ? brandColor : '#e5e5e5',
                  backgroundColor: isSelected ? `${brandColor}10` : 'white',
                  animationDelay: `${idx * 40}ms`,
                }}
              >
                <div
                  className="w-6 h-6 rounded flex items-center justify-center text-white text-sm flex-shrink-0"
                  style={{
                    backgroundColor: isSelected ? brandColor : '#e5e5e5',
                    borderColor: isSelected ? brandColor : '#ccc',
                  }}
                >
                  {isSelected && '✓'}
                </div>
                {option.emoji && <span className="text-xl">{option.emoji}</span>}
                <span className="font-medium text-gray-800">{option.label}</span>
              </button>
            )
          })}
        </div>

        <button
          onClick={onMultiContinue}
          className="w-full mt-4 p-4 rounded-xl text-white font-semibold transition-all duration-200"
          style={{ backgroundColor: brandColor }}
        >
          Continue
        </button>
      </div>
    )
  }

  // Single select (default)
  return (
    <div className="animate-fadeIn">
      <h2 className="text-xl font-semibold text-gray-900 mb-2 leading-tight">
        {question.title}
      </h2>
      {question.subtitle && (
        <p className="text-sm text-gray-500 mb-4">{question.subtitle}</p>
      )}

      <div className="space-y-2">
        {question.options.map((option, idx) => {
          const isSelected = answer === option.value
          const isFaded = hasSelection && !isSelected

          return (
            <button
              key={option.value}
              onClick={() => onAnswer(question.id, option.value)}
              className="w-full p-4 rounded-xl border-2 text-left transition-all duration-200 flex items-center gap-3"
              style={{
                borderColor: isSelected ? brandColor : '#e5e5e5',
                backgroundColor: isSelected ? `${brandColor}10` : 'white',
                opacity: isFaded ? 0.5 : 1,
                animationDelay: `${idx * 40}ms`,
              }}
            >
              {option.emoji && <span className="text-xl flex-shrink-0">{option.emoji}</span>}
              <span className="font-medium text-gray-800 flex-1">{option.label}</span>
              {option.percentage && !isSelected && (
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                  {option.percentage}%
                </span>
              )}
              {isSelected && (
                <span className="font-bold" style={{ color: brandColor }}>✓</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
