import { notFound } from 'next/navigation'
import { getConfig } from '@/lib/config'
import ResultsPage from '@/components/results/ResultsPage'

interface PageProps {
  params: Promise<{ funnel: string; condition: string }>
  searchParams: Promise<{ g?: string; u?: string; s?: string; f?: string }>
}

export default async function ConditionResultsPage({ params, searchParams }: PageProps) {
  const { funnel, condition: conditionSlug } = await params
  const { g, u, s, f } = await searchParams

  const config = await getConfig(funnel)
  if (!config) return notFound()

  const condition = config.conditions.find(c => c.slug === conditionSlug)
  if (!condition) return notFound()

  // Get objection content based on fear parameter
  const fearCode = f || 'd'
  const objectionKey = fearCode.toLowerCase()
  const objectionContent = config.objectionContent[objectionKey]

  return (
    <ResultsPage
      config={config}
      condition={condition}
      urgencyBand={u || 'M'}
      urgencyScore={parseInt(s || '70')}
      objectionContent={objectionContent}
    />
  )
}

// Generate metadata for the results page
export async function generateMetadata({ params }: PageProps) {
  const { funnel, condition: conditionSlug } = await params
  const config = await getConfig(funnel)

  if (!config) {
    return {
      title: 'Results Not Found',
    }
  }

  const condition = config.conditions.find(c => c.slug === conditionSlug)

  return {
    title: condition
      ? `Your Results - ${condition.shortName} | ${config.funnel.name}`
      : `Your Results | ${config.funnel.name}`,
    description: condition?.resultsCopy.intro || config.funnel.hook.subheadline,
  }
}
