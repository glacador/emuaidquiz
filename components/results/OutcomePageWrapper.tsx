import { createClient } from '@/lib/supabase/server'
import { FunnelConfig, Condition, ObjectionContent } from '@/config/schema'
import ResultsPage from './ResultsPage'

interface OutcomePageWrapperProps {
  config: FunnelConfig
  condition: Condition
  urgencyBand: string
  urgencyScore: number
  objectionContent?: ObjectionContent
}

export default async function OutcomePageWrapper({
  config,
  condition,
  urgencyBand,
  urgencyScore,
  objectionContent,
}: OutcomePageWrapperProps) {
  let customHtml: string | null = null
  let customCss: string | null = null

  try {
    const supabase = await createClient()

    // Fetch custom HTML/CSS from database based on condition slug and funnel
    const { data, error } = await supabase
      .from('conditions')
      .select('custom_html, custom_css')
      .eq('slug', condition.slug)
      .maybeSingle()

    if (!error && data) {
      customHtml = data.custom_html
      customCss = data.custom_css
    }
  } catch (e) {
    // If database is not available, fall back to default template
    console.error('Failed to fetch custom HTML:', e)
  }

  return (
    <ResultsPage
      config={config}
      condition={condition}
      urgencyBand={urgencyBand}
      urgencyScore={urgencyScore}
      objectionContent={objectionContent}
      customHtml={customHtml}
      customCss={customCss}
    />
  )
}
