import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import QuestionsList from '@/components/admin/QuestionsList'

interface PageProps {
  searchParams: Promise<{ funnel?: string }>
}

export default async function QuestionsPage({ searchParams }: PageProps) {
  const { funnel: funnelId } = await searchParams

  let funnels: { id: string; name: string }[] = []
  let questions: unknown[] | null = null
  let selectedFunnel: { id: string; name: string } | null = null
  let error: string | null = null

  // Check if Supabase is configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
    error = 'Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.'
  } else {
    try {
      const supabase = await createClient()

      // Fetch funnels for dropdown
      const { data: funnelData, error: funnelError } = await supabase
        .from('funnels')
        .select('id, name')
        .order('name')

      if (funnelError) throw funnelError
      funnels = funnelData || []

      // Fetch questions if funnel is selected
      if (funnelId) {
        const { data, error: questionsError } = await supabase
          .from('questions')
          .select(`
            *,
            options:question_options(*)
          `)
          .eq('funnel_id', funnelId)
          .order('sort_order')

        if (questionsError) throw questionsError
        questions = data

        selectedFunnel = funnels.find(f => f.id === funnelId) || null
      }
    } catch (e) {
      console.error('Database error:', e)
      error = 'Unable to connect to database. Make sure Supabase is configured and tables are created.'
    }
  }

  if (error) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Questions</h1>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Database Error</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <div className="text-sm text-red-700">
            <p className="font-medium mb-2">To fix this:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Go to your Supabase project</li>
              <li>Run the SQL migrations in the SQL Editor</li>
              <li>Make sure environment variables are set in Vercel</li>
            </ol>
          </div>
        </div>
      </div>
    )
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
            {funnels.map((funnel) => (
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
          <QuestionsList questions={questions as never[]} funnelId={funnelId} />
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <p className="text-gray-500 mb-4">
              No questions yet for {selectedFunnel?.name || 'this funnel'}. Add your first question.
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
          <p className="text-gray-500">
            {funnels.length === 0
              ? 'No funnels found. Create a funnel first in the Funnels section.'
              : 'Select a funnel to manage its questions.'}
          </p>
        </div>
      )}
    </div>
  )
}
