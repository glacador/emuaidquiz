import { Metadata } from 'next'
import OutcomePageWrapper from '@/components/results/OutcomePageWrapper'
import acnescopeConfig from '@/config/funnels/acnescope.json'
import { FunnelConfig } from '@/config/schema'

const config = acnescopeConfig as unknown as FunnelConfig
const condition = config.conditions.find(c => c.slug === 'sycosis-barbae')!

export const metadata: Metadata = {
  title: `Your Results - Sycosis Barbae | ${config.funnel.name}`,
  description: condition.resultsCopy.intro,
}

interface PageProps {
  searchParams: Promise<{ g?: string; u?: string; s?: string; f?: string }>
}

export default async function SycosisBarbaeResultsPage({ searchParams }: PageProps) {
  const { u, f } = await searchParams

  const fearCode = f || 'd'
  const objectionKey = fearCode.toLowerCase()
  const objectionContent = config.objectionContent[objectionKey]

  return (
    <OutcomePageWrapper
      config={config}
      condition={condition}
      urgencyBand={u || 'M'}
      urgencyScore={70}
      objectionContent={objectionContent}
    />
  )
}
