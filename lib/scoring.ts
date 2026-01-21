// Scoring Algorithm for Quiz Funnel Factory
import { FunnelConfig, ScoringResult, SlideType } from '@/config/schema'

export function scoreQuiz(
  answers: Record<string, string>,
  multiAnswers: Record<string, string[]>,
  config: FunnelConfig
): ScoringResult {
  // Initialize scores from config
  const scores: Record<string, number> = {}
  config.conditions.forEach(c => {
    scores[c.code] = c.scoring.baseWeight || 0
  })

  // Process each question's scoring
  config.questions.forEach((q: SlideType) => {
    if (q.type === 'belief-card' || q.type === 'social-proof') return

    const answer = answers[q.id]
    if (!answer) return

    const option = q.options?.find(o => o.value === answer)
    if (option?.scores) {
      Object.entries(option.scores).forEach(([code, points]) => {
        scores[code] = (scores[code] || 0) + (points as number)
      })
    }
  })

  // Process multi-select answers
  Object.entries(multiAnswers).forEach(([questionId, values]) => {
    const question = config.questions.find(q => q.id === questionId)
    if (!question || question.type === 'belief-card' || question.type === 'social-proof') return

    values.forEach(value => {
      const option = question.options?.find(o => o.value === value)
      if (option?.scores) {
        Object.entries(option.scores).forEach(([code, points]) => {
          scores[code] = (scores[code] || 0) + (points as number)
        })
      }
    })
  })

  // Find winner
  const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]) as [string, number][]
  const [topCode, topScore] = ranked[0] || ['', 0]
  const [, secondScore] = ranked[1] || ['', 0]

  // Calculate confidence
  const diff = topScore - secondScore
  const confidence: 'low' | 'medium' | 'high' = diff > 10 ? 'high' : diff > 5 ? 'medium' : 'low'

  // Calculate urgency (45-100 range per spec)
  let urgency = 45

  config.questions.forEach((q: SlideType) => {
    if (q.type === 'belief-card' || q.type === 'social-proof') return

    const answer = answers[q.id]
    if (!answer) return

    const option = q.options?.find(o => o.value === answer)
    if (option?.urgencyAdd) {
      urgency += option.urgencyAdd
    }
  })

  // Treatment history adds urgency
  const tried = multiAnswers['9'] || []
  if (tried.includes('c')) urgency += 3 // Tried prescription
  if (tried.includes('e')) urgency += 5 // Tried Accutane
  if (tried.length >= 3) urgency += 2

  // Clamp urgency to 45-100 range
  urgency = Math.min(100, Math.max(45, urgency))

  // Calculate band
  const band: 'L' | 'M' | 'MH' | 'H' = urgency >= 85 ? 'H' : urgency >= 70 ? 'MH' : urgency >= 55 ? 'M' : 'L'

  // Get condition slug
  const condition = config.conditions.find(c => c.code === topCode)
  const conditionSlug = condition?.slug || 'mixed'

  return {
    groupCode: topCode,
    conditionSlug,
    urgency,
    band,
    confidence,
    scores
  }
}

// Helper to calculate display score (75-98 range for UI)
export function calculateDisplayScore(urgency: number): number {
  return Math.round(75 + ((urgency - 45) / 55) * 23)
}

// Helper to determine intent level
export function abstractIntent(urgency: number): 'ready' | 'considering' | 'exploring' {
  return urgency >= 75 ? 'ready' : urgency >= 55 ? 'considering' : 'exploring'
}

// Helper to determine engagement level
export function abstractEngagement(answered: number, total: number): 'complete' | 'engaged' | 'early' {
  const ratio = answered / total
  return ratio >= 0.8 ? 'complete' : ratio >= 0.4 ? 'engaged' : 'early'
}
