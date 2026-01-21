import { createClient } from '@/lib/supabase/client'

export interface ABVariant {
  id: string
  name: string
  weight: number
  is_control: boolean
  config: {
    brandColor?: string
    brandColorLight?: string
    brandColorBg?: string
    headlineText?: string
    ctaText?: string
  }
}

export interface ABTest {
  id: string
  name: string
  test_type: string
  variants: ABVariant[]
}

// Get or create session ID
export function getSessionId(): string {
  if (typeof window === 'undefined') return ''

  let sessionId = localStorage.getItem('quiz_session_id')
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    localStorage.setItem('quiz_session_id', sessionId)
  }
  return sessionId
}

// Get assigned variant from storage (consistent experience)
export function getAssignedVariant(testId: string): string | null {
  if (typeof window === 'undefined') return null
  const key = `ab_variant_${testId}`
  return localStorage.getItem(key)
}

// Save assigned variant
export function setAssignedVariant(testId: string, variantId: string): void {
  if (typeof window === 'undefined') return
  const key = `ab_variant_${testId}`
  localStorage.setItem(key, variantId)
}

// Select a variant based on weights
export function selectVariant(variants: ABVariant[]): ABVariant {
  const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0)
  const random = Math.random() * totalWeight

  let cumulative = 0
  for (const variant of variants) {
    cumulative += variant.weight
    if (random <= cumulative) {
      return variant
    }
  }

  // Fallback to first variant
  return variants[0]
}

// Get active A/B test for a funnel
export async function getActiveTest(funnelId: string): Promise<ABTest | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('ab_tests')
    .select(`
      id,
      name,
      test_type,
      variants:ab_test_variants(
        id,
        name,
        weight,
        is_control,
        config
      )
    `)
    .eq('funnel_id', funnelId)
    .eq('status', 'active')
    .limit(1)
    .single()

  if (error || !data) return null

  return data as ABTest
}

// Get variant for user (with persistence)
export async function getVariantForUser(funnelId: string): Promise<{
  test: ABTest | null
  variant: ABVariant | null
}> {
  const test = await getActiveTest(funnelId)

  if (!test || !test.variants.length) {
    return { test: null, variant: null }
  }

  // Check if user already has an assigned variant
  const assignedVariantId = getAssignedVariant(test.id)
  if (assignedVariantId) {
    const variant = test.variants.find((v) => v.id === assignedVariantId)
    if (variant) {
      return { test, variant }
    }
  }

  // Select new variant
  const variant = selectVariant(test.variants)
  setAssignedVariant(test.id, variant.id)

  // Record the assignment
  const supabase = createClient()
  const sessionId = getSessionId()

  await supabase.from('ab_test_results').insert({
    test_id: test.id,
    variant_id: variant.id,
    session_id: sessionId,
    converted: false,
  })

  return { test, variant }
}

// Track conversion
export async function trackConversion(
  testId: string,
  variantId: string,
  conditionCode?: string,
  conversionValue?: number
): Promise<void> {
  const supabase = createClient()
  const sessionId = getSessionId()

  await supabase
    .from('ab_test_results')
    .update({
      converted: true,
      condition_code: conditionCode,
      conversion_value: conversionValue,
    })
    .eq('test_id', testId)
    .eq('variant_id', variantId)
    .eq('session_id', sessionId)
}

// Apply variant config to funnel config
export function applyVariantConfig(
  funnelConfig: {
    brandColor: string
    brandColorLight: string
    brandColorBg: string
  },
  variant: ABVariant
): {
  brandColor: string
  brandColorLight: string
  brandColorBg: string
} {
  return {
    brandColor: variant.config.brandColor || funnelConfig.brandColor,
    brandColorLight: variant.config.brandColorLight || funnelConfig.brandColorLight,
    brandColorBg: variant.config.brandColorBg || funnelConfig.brandColorBg,
  }
}
