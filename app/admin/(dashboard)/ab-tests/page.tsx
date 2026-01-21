import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import ABTestCard from '@/components/admin/ABTestCard'

export default async function ABTestsPage() {
  const supabase = await createClient()

  const { data: tests } = await supabase
    .from('ab_tests')
    .select(`
      *,
      funnel:funnels(id, name),
      variants:ab_test_variants(
        id,
        name,
        weight,
        is_control,
        results:ab_test_results(count)
      )
    `)
    .order('created_at', { ascending: false })

  const activeTests = tests?.filter(t => t.status === 'active') || []
  const draftTests = tests?.filter(t => t.status === 'draft') || []
  const completedTests = tests?.filter(t => t.status === 'completed' || t.status === 'paused') || []

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">A/B Tests</h1>
        <Link
          href="/admin/ab-tests/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + New Test
        </Link>
      </div>

      {/* Active Tests */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-3 h-3 bg-green-500 rounded-full"></span>
          Active Tests ({activeTests.length})
        </h2>
        {activeTests.length > 0 ? (
          <div className="grid gap-4">
            {activeTests.map((test) => (
              <ABTestCard key={test.id} test={test} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 bg-white p-4 rounded-lg">No active tests</p>
        )}
      </section>

      {/* Draft Tests */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
          Draft Tests ({draftTests.length})
        </h2>
        {draftTests.length > 0 ? (
          <div className="grid gap-4">
            {draftTests.map((test) => (
              <ABTestCard key={test.id} test={test} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 bg-white p-4 rounded-lg">No draft tests</p>
        )}
      </section>

      {/* Completed Tests */}
      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-3 h-3 bg-gray-400 rounded-full"></span>
          Completed Tests ({completedTests.length})
        </h2>
        {completedTests.length > 0 ? (
          <div className="grid gap-4">
            {completedTests.map((test) => (
              <ABTestCard key={test.id} test={test} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 bg-white p-4 rounded-lg">No completed tests</p>
        )}
      </section>
    </div>
  )
}
