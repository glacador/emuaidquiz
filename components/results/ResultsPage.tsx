'use client'

import { FunnelConfig, Condition, ObjectionContent } from '@/config/schema'
import BuyboxWidget from './BuyboxWidget'
import FAQSection from './FAQSection'
import TestimonialCard from './TestimonialCard'
import TrustBadges from './TrustBadges'

interface ResultsPageProps {
  config: FunnelConfig
  condition: Condition
  urgencyBand: string
  urgencyScore: number
  objectionContent?: ObjectionContent
}

// Parse markdown bold (**text**) to React elements
function parseMarkdownBold(text: string): React.ReactNode {
  const parts: React.ReactNode[] = []
  let idx = 0
  let key = 0
  const regex = /\*\*(.+?)\*\*/g
  let match

  while ((match = regex.exec(text)) !== null) {
    if (match.index > idx) {
      parts.push(text.substring(idx, match.index))
    }
    parts.push(<strong key={`b-${key++}`}>{match[1]}</strong>)
    idx = match.index + match[0].length
  }

  if (idx < text.length) {
    parts.push(text.substring(idx))
  }

  return parts.length ? parts : text
}

// Format body text with markdown and line breaks
function formatBody(body: string): React.ReactNode {
  const paragraphs = body.split('\n\n')

  return paragraphs.map((para, i) => {
    // Handle bullet points
    if (para.includes('• ')) {
      const lines = para.split('\n').filter(Boolean)
      return (
        <div key={i} className="mb-4">
          {lines.map((line, j) => {
            if (line.startsWith('**') && line.endsWith('**')) {
              return (
                <h4 key={j} className="font-semibold text-gray-800 mt-4 mb-2">
                  {line.replace(/\*\*/g, '')}
                </h4>
              )
            }
            if (line.startsWith('• ')) {
              return (
                <div key={j} className="flex gap-2 mb-1">
                  <span className="text-gray-400">•</span>
                  <span>{parseMarkdownBold(line.substring(2))}</span>
                </div>
              )
            }
            return <p key={j} className="mb-2">{parseMarkdownBold(line)}</p>
          })}
        </div>
      )
    }

    // Regular paragraph
    return (
      <p key={i} className="mb-4">
        {parseMarkdownBold(para)}
      </p>
    )
  })
}

export default function ResultsPage({
  config,
  condition,
  urgencyBand,
  urgencyScore,
  objectionContent,
}: ResultsPageProps) {
  const { resultsCopy } = condition

  return (
    <div className="max-w-[480px] mx-auto bg-white min-h-screen">
      {/* Header */}
      <div
        className="px-5 py-4 flex items-center justify-between"
        style={{ backgroundColor: config.funnel.brandColor }}
      >
        <span className="font-bold text-white">{config.funnel.name}</span>
        <span className="text-white text-xs opacity-90">📞 1-800-XXX-XXXX</span>
      </div>

      {/* Results Header */}
      <div
        className="px-5 py-6"
        style={{
          backgroundColor: config.funnel.brandColorBg,
          borderBottom: `3px solid ${config.funnel.brandColor}`,
        }}
      >
        <div
          className="text-xs font-semibold tracking-wider mb-2"
          style={{ color: config.funnel.brandColor }}
        >
          {resultsCopy.label}
        </div>
        <h1 className="text-2xl font-bold text-gray-900 leading-tight">
          {resultsCopy.headline}
        </h1>
      </div>

      {/* Introduction */}
      <div className="px-5 py-5">
        <p className="text-gray-700 leading-relaxed">
          {resultsCopy.intro}
        </p>
      </div>

      {/* Trust Badges */}
      <TrustBadges badges={config.trustBadges} />

      {/* Body Content */}
      <div className="px-5 pb-5 text-sm text-gray-600 leading-relaxed">
        {formatBody(resultsCopy.body)}
      </div>

      {/* Dynamic Objection Handler */}
      {objectionContent && (
        <div
          className="mx-5 mb-5 p-4 rounded-lg"
          style={{
            backgroundColor: '#f8f9fa',
            borderLeft: `4px solid ${config.funnel.brandColor}`,
          }}
        >
          <div className="font-semibold text-gray-800 mb-2">
            {objectionContent.headline}
          </div>
          <div className="text-sm text-gray-600">
            {objectionContent.body}
          </div>
        </div>
      )}

      {/* Buybox Widget */}
      <BuyboxWidget
        config={config.buybox}
        brandColor={config.funnel.brandColor}
        conditionCode={condition.code}
      />

      {/* Testimonial */}
      <TestimonialCard
        condition={condition}
        brandColor={config.funnel.brandColor}
      />

      {/* FAQ Section */}
      <FAQSection brandColor={config.funnel.brandColor} />

      {/* Footer */}
      <div className="px-5 py-6 bg-gray-100 text-center">
        <p className="text-xs text-gray-500">
          © {new Date().getFullYear()} EMUAID. All rights reserved.
        </p>
        <p className="text-xs text-gray-400 mt-2 leading-relaxed">
          These statements have not been evaluated by the FDA.
          This product is not intended to diagnose, treat, cure, or prevent any disease.
        </p>
      </div>
    </div>
  )
}
