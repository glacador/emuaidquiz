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
  customHtml?: string | null
  customCss?: string | null
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
  objectionContent,
  customHtml,
  customCss,
}: ResultsPageProps) {
  const { resultsCopy } = condition

  // If custom HTML is provided, render it with the buybox and footer
  if (customHtml) {
    // Process template variables in custom HTML
    const processedHtml = customHtml
      .replace(/\{\{condition_name\}\}/g, condition.name)
      .replace(/\{\{condition_code\}\}/g, condition.code)
      .replace(/\{\{headline\}\}/g, resultsCopy.headline)
      .replace(/\{\{intro\}\}/g, resultsCopy.intro)
      .replace(/\{\{body\}\}/g, resultsCopy.body)
      .replace(/\{\{urgency_band\}\}/g, urgencyBand)
      .replace(/\{\{brand_color\}\}/g, config.funnel.brandColor)

    return (
      <div className="max-w-[480px] mx-auto bg-white min-h-screen">
        {/* Custom CSS */}
        {customCss && <style dangerouslySetInnerHTML={{ __html: customCss }} />}

        {/* Header */}
        <div
          className="px-5 py-4 flex items-center justify-between"
          style={{ backgroundColor: config.funnel.brandColor }}
        >
          <span className="font-bold text-white text-lg">{config.funnel.name}</span>
          <a href="tel:1-800-319-0692" className="text-white text-sm opacity-90 flex items-center gap-1">
            <span>📞</span> 1-800-319-0692
          </a>
        </div>

        {/* Custom HTML Content */}
        <div dangerouslySetInnerHTML={{ __html: processedHtml }} />

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

  // Timeline based on urgency band
  const getTimeline = () => {
    switch (urgencyBand) {
      case 'H': return { weeks: '2-3', text: 'Early improvements expected' }
      case 'MH': return { weeks: '3-4', text: 'Initial changes expected' }
      case 'M': return { weeks: '4-5', text: 'Gradual progress expected' }
      default: return { weeks: '4-6', text: 'Steady improvement expected' }
    }
  }

  const timeline = getTimeline()

  return (
    <div className="max-w-[480px] mx-auto bg-white min-h-screen">
      {/* Header */}
      <div
        className="px-5 py-4 flex items-center justify-between"
        style={{ backgroundColor: config.funnel.brandColor }}
      >
        <span className="font-bold text-white text-lg">{config.funnel.name}</span>
        <a href="tel:1-800-319-0692" className="text-white text-sm opacity-90 flex items-center gap-1">
          <span>📞</span> 1-800-319-0692
        </a>
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
          className="text-xs font-semibold tracking-wider mb-2 uppercase"
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

      {/* Personalized Protocol Section */}
      <div className="px-5 py-4">
        <div
          className="p-4 rounded-xl"
          style={{ backgroundColor: `${config.funnel.brandColor}08` }}
        >
          <h3
            className="text-sm font-bold mb-3"
            style={{ color: config.funnel.brandColor }}
          >
            YOUR PERSONALIZED PROTOCOL
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed">
            Based on your {condition.shortName.toLowerCase()}, we&apos;ve identified a targeted approach
            that addresses your specific concerns.
          </p>
        </div>
      </div>

      {/* Body Content */}
      <div className="px-5 pb-5 text-sm text-gray-600 leading-relaxed">
        {formatBody(resultsCopy.body)}
      </div>

      {/* Based on Your Answers Section */}
      <div className="px-5 py-4">
        <h3 className="text-sm font-bold text-gray-800 mb-3">BASED ON YOUR ANSWERS:</h3>
        <div className="flex flex-wrap gap-2">
          <span
            className="px-3 py-1.5 rounded-full text-sm font-medium"
            style={{
              backgroundColor: `${config.funnel.brandColor}15`,
              color: config.funnel.brandColor,
            }}
          >
            {timeline.weeks} weeks
          </span>
          <span
            className="px-3 py-1.5 rounded-full text-sm font-medium"
            style={{
              backgroundColor: `${config.funnel.brandColor}15`,
              color: config.funnel.brandColor,
            }}
          >
            {timeline.text}
          </span>
          <span
            className="px-3 py-1.5 rounded-full text-sm font-medium"
            style={{
              backgroundColor: `${config.funnel.brandColor}15`,
              color: config.funnel.brandColor,
            }}
          >
            {condition.shortName}
          </span>
        </div>
      </div>

      {/* Stats Section */}
      <div className="px-5 py-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 rounded-xl bg-gray-50">
            <div className="text-2xl font-black text-gray-900">30</div>
            <div className="text-xs text-gray-600">Day Money Back</div>
          </div>
          <div className="text-center p-3 rounded-xl bg-gray-50">
            <div className="text-2xl font-black text-gray-900">45K+</div>
            <div className="text-xs text-gray-600">5-Star Reviews</div>
          </div>
          <div className="text-center p-3 rounded-xl bg-gray-50">
            <div className="text-2xl font-black text-gray-900">FDA</div>
            <div className="text-xs text-gray-600">Registered</div>
          </div>
        </div>
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
