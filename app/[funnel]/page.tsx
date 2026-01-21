import { notFound } from 'next/navigation'
import { getConfig } from '@/lib/config'
import QuizEngine from '@/components/quiz/QuizEngine'

interface PageProps {
  params: Promise<{ funnel: string }>
}

export default async function QuizPage({ params }: PageProps) {
  const { funnel } = await params
  const config = await getConfig(funnel)

  if (!config) {
    return notFound()
  }

  return <QuizEngine config={config} />
}

// Generate metadata for the quiz page
export async function generateMetadata({ params }: PageProps) {
  const { funnel } = await params
  const config = await getConfig(funnel)

  if (!config) {
    return {
      title: 'Quiz Not Found',
    }
  }

  return {
    title: `${config.funnel.name} - ${config.funnel.tagline}`,
    description: config.funnel.hook.subheadline,
  }
}
