// Configuration Schema for Quiz Funnel Factory

export interface FunnelMeta {
  id: string
  name: string
  tagline: string
  domain: string
  brandColor: string
  brandColorLight: string
  brandColorBg: string
  hook: {
    headline: string
    subheadline: string
    stat: string
  }
  quizMeta: {
    questionCount: string
    timeEstimate: string
    ctaText: string
    socialProofCount: number
  }
}

export interface ResultsCopy {
  label: string
  headline: string
  intro: string
  body: string
}

export interface ConditionScoring {
  baseWeight: number
}

export interface Condition {
  code: string
  name: string
  slug: string
  shortName: string
  resultsCopy: ResultsCopy
  scoring: ConditionScoring
}

export interface QuestionOption {
  label: string
  sublabel?: string
  value: string
  emoji?: string
  imageKey?: string
  scores?: Record<string, number>
  urgencyAdd?: number
  percentage?: number
  code?: string
  priority?: string
}

export interface QuestionSlideType {
  id: string
  type: 'single' | 'multi' | 'image-grid'
  title: string
  subtitle?: string
  helpText?: string
  options: QuestionOption[]
}

export interface BeliefCardSlideType {
  id: string
  type: 'belief-card'
  icon: string
  stat?: string
  headline: string
  subtext: string
  duration: number
}

export interface SocialProofSlideType {
  id: string
  type: 'social-proof'
  name: string
  location: string
  pattern: string
  quote: string
  timeAgo: string
  duration: number
}

export type SlideType = QuestionSlideType | BeliefCardSlideType | SocialProofSlideType

export interface ObjectionContent {
  headline: string
  body: string
}

export interface TrackingConfig {
  klaviyoPublicKey: string
  klaviyoListId: string
  metaPixelId: string
  ga4MeasurementId: string
  zerobounceEndpoint: string
}

export interface PlanOption {
  plan: string
  price: string
  old: string
  perDay: string
  badge: string
  variantId: string
  sellingPlanId?: string
  quantity: number
}

export interface TryOnceOption {
  price: string
  old: string
  perDay: string
  variantId: string
  quantity: number
}

export interface OfferConfig {
  label: string
  product: string
  plans: PlanOption[]
  tryOnce: TryOnceOption
}

export interface BuyboxConfig {
  useSharedWidget: boolean
  shopOrigin: string
  offers: {
    complete: OfferConfig
    single: OfferConfig
  }
}

export interface TrustBadge {
  name: string
  logo: string
}

export interface FunnelConfig {
  funnel: FunnelMeta
  conditions: Condition[]
  questions: SlideType[]
  objectionContent: Record<string, ObjectionContent>
  tracking: TrackingConfig
  buybox: BuyboxConfig
  trustBadges: TrustBadge[]
}

// Scoring result types
export interface ScoringResult {
  groupCode: string
  conditionSlug: string
  urgency: number
  band: 'L' | 'M' | 'MH' | 'H'
  confidence: 'low' | 'medium' | 'high'
  scores: Record<string, number>
}
