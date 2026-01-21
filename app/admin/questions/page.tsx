import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import QuestionsList from '@/components/admin/QuestionsList'

interface PageProps {
  searchParams: Promise<{ funnel?: string }>
}

export default async function QuestionsPage({ searchParams }: PageProps) {
  const { funnel: funnelId } = await searchParams
  const supabase = await createClient()

  // Fetch funnels for dropdown
  const { data: funnels } = await supabase
    .from('funnels')
    .select('id, name')
    .order('name')

  // Fetch questions if funnel is selected
  let questions = null
  let selectedFunnel = null

  if (funnelId) {
    const { data } = await supabase
      .from('questions')
      .select(`
        *,
        options:question_options(*)
      `)
      .eq('funnel_id', funnelId)
      .order('sort_order')

    questions = data

    selectedFunnel = funnels?.find(f => f.id === funnelId)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Questions</h1>
        {funnelId && (
          <Link
            href={`/admin/questions/new?funnel=${funnelId}`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Add Question
          </Link>
        )}
      </div>

      {/* Funnel Selector */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Funnel
        </label>
        <form>
          <select
            name="funnel"
            defaultValue={funnelId || ''}
            onChange={(e) => {
              if (e.target.value) {
                window.location.href = `/admin/questions?funnel=${e.target.value}`
              }
            }}
            className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Choose a funnel...</option>
            {funnels?.map((funnel) => (
              <option key={funnel.id} value={funnel.id}>
                {funnel.name}
              </option>
            ))}
          </select>
        </form>
      </div>

      {/* Questions List */}
      {funnelId ? (
        questions && questions.length > 0 ? (
          <QuestionsList questions={questions} funnelId={funnelId} />
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <p className="text-gray-500 mb-4">
              No questions yet for {selectedFunnel?.name}. Add your first question.
            </p>
            <Link
              href={`/admin/questions/new?funnel=${funnelId}`}
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Add Question
            </Link>
          </div>
        )
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <p className="text-gray-500">Select a funnel to manage its questions.</p>
        </div>
      )}
    </div>
  )
}
