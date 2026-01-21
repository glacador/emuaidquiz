import { Metadata } from 'next'
import ResultsPage from '@/components/results/ResultsPage'
import acnescopeConfig from '@/config/funnels/acnescope.json'
import { FunnelConfig } from '@/config/schema'

const config = acnescopeConfig as unknown as FunnelConfig
const condition = config.conditions.find(c => c.slug === 'cystic')!

export const metadata: Metadata = {
  title: `Your Results - Cystic Acne Pattern | ${config.funnel.name}`,
  description: condition.resultsCopy.intro,
}

interface PageProps {
  searchParams: Promise<{ g?: string; u?: string; s?: string; f?: string }>
}

export default async function CysticResultsPage({ searchParams }: PageProps) {
  const { u, f } = await searchParams

  const fearCode = f || 'd'
  const objectionKey = fearCode.toLowerCase()
  const objectionContent = config.objectionContent[objectionKey]

  return (
    <ResultsPage
      config={config}
      condition={condition}
      urgencyBand={u || 'M'}
      urgencyScore={70}
      objectionContent={objectionContent}
    />
  )
}
