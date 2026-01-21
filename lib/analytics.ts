// Analytics utilities for Quiz Funnel Factory
import { FunnelConfig } from '@/config/schema'

// Type declarations for global objects
declare global {
  interface Window {
    dataLayer: unknown[]
    gtag: (...args: unknown[]) => void
    fbq: (...args: unknown[]) => void
    _learnq: unknown[][]
  }
}

// Initialize GA4
export function initGA4(measurementId?: string): void {
  if (!measurementId || typeof window === 'undefined') return

  window.dataLayer = window.dataLayer || []
  const gtag = (...args: unknown[]) => window.dataLayer.push(args as unknown)
  window.gtag = gtag

  gtag('consent', 'default', {
    ad_user_data: 'granted',
    ad_personalization: 'granted',
    analytics_storage: 'granted',
    ad_storage: 'granted',
  })

  // Load gtag script
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
  document.head.appendChild(script)

  script.onload = () => {
    gtag('js', new Date())
    gtag('config', measurementId)
  }
}

// Initialize Meta Pixel
export function initMetaPixel(pixelId?: string): void {
  if (!pixelId || typeof window === 'undefined') return

  if (typeof window.fbq !== 'function') {
    const fbq: { (...args: unknown[]): void; callMethod?: (...args: unknown[]) => void; queue: unknown[]; push: typeof fbq; loaded: boolean; version: string } = function(...args: unknown[]) {
      if (fbq.callMethod) {
        fbq.callMethod.apply(fbq, args)
      } else {
        fbq.queue.push(args)
      }
    }
    fbq.push = fbq
    fbq.loaded = true
    fbq.version = '2.0'
    fbq.queue = []
    window.fbq = fbq

    const script = document.createElement('script')
    script.async = true
    script.src = 'https://connect.facebook.net/en_US/fbevents.js'
    document.head.appendChild(script)
  }

  window.fbq('init', pixelId)
  window.fbq('consent', 'grant')
}

// Initialize Klaviyo
export function initKlaviyo(publicKey?: string): void {
  if (!publicKey || typeof window === 'undefined') return
  if (window._learnq) return

  window._learnq = []
  const script = document.createElement('script')
  script.async = true
  script.src = `https://static.klaviyo.com/onsite/js/klaviyo.js?company_id=${publicKey}`
  document.head.appendChild(script)
}

// Fire GA4 event
export function fireGA4Event(eventName: string, params: Record<string, unknown>): void {
  if (typeof window === 'undefined' || !window.gtag) return
  window.gtag('event', eventName, params)
}

// Fire Meta event
export function fireMetaEvent(eventName: string, params: Record<string, unknown>): void {
  if (typeof window === 'undefined' || !window.fbq) return
  window.fbq('track', eventName, params)
}

// Push to Klaviyo
export interface KlaviyoPayload {
  email: string
  firstName?: string
  groupCode: string
  urgency: number
  band: string
  intent: string
  t: string[] // Coded treatment values
  f: string   // Coded fear value
  config: FunnelConfig
}

export function pushToKlaviyo(data: KlaviyoPayload): void {
  if (typeof window === 'undefined' || !window._learnq) return

  const identifyPayload: Record<string, unknown> = {
    $email: data.email,
    quiz_group_code: data.groupCode,
    quiz_urgency: data.urgency,
    quiz_band: data.band,
    quiz_intent: data.intent,
    quiz_treatments_tried: data.t,
    quiz_fear: data.f,
    quiz_id: data.config.funnel.id,
    quiz_version: 'v1',
    quiz_completed_at: new Date().toISOString(),
  }

  if (data.firstName?.trim()) {
    identifyPayload.$first_name = data.firstName.trim()
  }

  window._learnq.push(['identify', identifyPayload])
  window._learnq.push(['track', 'Quiz Completed', {
    quiz_id: data.config.funnel.id,
    quiz_version: 'v1',
    group_code: data.groupCode,
    urgency: data.urgency,
    band: data.band,
    intent: data.intent,
    treatments_tried: data.t,
    fear: data.f,
  }])
}

// Push dataLayer event
export function pushDataLayerEvent(event: string, params: Record<string, unknown>): void {
  if (typeof window === 'undefined') return
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({ event, ...params })
}

// Code mappings for Meta-safe values
export const TREATMENT_CODE_MAP: Record<string, string> = {
  'a': 'AT1',
  'b': 'AT2',
  'c': 'AT3',
  'd': 'AT4',
  'e': 'AT5',
  'f': 'AT0',
}

export const FEAR_CODE_MAP: Record<string, string> = {
  'a': 'AF1',
  'b': 'AF2',
  'c': 'AF3',
  'd': 'AF4',
}

export function codeTreatments(treatments: string[]): string[] {
  return treatments.map(t => TREATMENT_CODE_MAP[t]).filter(Boolean)
}

export function codeFear(fear: string): string {
  return FEAR_CODE_MAP[fear.toLowerCase()] || 'AF4'
}
