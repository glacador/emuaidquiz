import { Metadata } from 'next'
import QuizEngine from '@/components/quiz/QuizEngine'
import acnescopeConfig from '@/config/funnels/acnescope.json'
import { FunnelConfig } from '@/config/schema'

const config = acnescopeConfig as unknown as FunnelConfig

export const metadata: Metadata = {
  title: `${config.funnel.name} - ${config.funnel.tagline}`,
  description: config.funnel.hook.subheadline,
}

export default function AcneScopeQuizPage() {
  return <QuizEngine config={config} />
}
