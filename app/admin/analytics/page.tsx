import { createClient } from '@/lib/supabase/server'

export default async function AnalyticsPage() {
  const supabase = await createClient()

  // Fetch overall stats
  const { count: totalSessions } = await supabase
    .from('quiz_sessions')
    .select('*', { count: 'exact', head: true })

  const { count: completedSessions } = await supabase
    .from('quiz_sessions')
    .select('*', { count: 'exact', head: true })
    .not('completed_at', 'is', null)

  const { count: convertedSessions } = await supabase
    .from('quiz_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('converted', true)

  // Fetch sessions by funnel
  const { data: funnelStats } = await supabase
    .from('quiz_sessions')
    .select('funnel_id, funnels(name)')
    .not('funnel_id', 'is', null)

  // Group by funnel
  const funnelCounts: Record<string, { name: string; count: number }> = {}
  funnelStats?.forEach((s) => {
    const fid = s.funnel_id
    const funnelData = s.funnels as unknown as { name: string } | null
    const fname = funnelData?.name || 'Unknown'
    if (!funnelCounts[fid]) {
      funnelCounts[fid] = { name: fname, count: 0 }
    }
    funnelCounts[fid].count++
  })

  // Fetch recent sessions
  const { data: recentSessions } = await supabase
    .from('quiz_sessions')
    .select(`
      id,
      email,
      condition_code,
      urgency_band,
      converted,
      created_at,
      funnels(name)
    `)
    .order('created_at', { ascending: false })
    .limit(20)

  // A/B test performance
  const { data: abTests } = await supabase
    .from('ab_tests')
    .select(`
      id,
      name,
      status,
      variants:ab_test_variants(
        id,
        name,
        is_control,
        results:ab_test_results(
          converted
        )
      )
    `)
    .eq('status', 'active')

  const completionRate = totalSessions
    ? ((completedSessions || 0) / totalSessions * 100).toFixed(1)
    : '0'

  const conversionRate = completedSessions
    ? ((convertedSessions || 0) / completedSessions * 100).toFixed(1)
    : '0'

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Analytics</h1>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Total Sessions</p>
          <p className="text-3xl font-bold text-gray-900">{totalSessions || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Completed</p>
          <p className="text-3xl font-bold text-gray-900">{completedSessions || 0}</p>
          <p className="text-sm text-green-600">{completionRate}% rate</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Conversions</p>
          <p className="text-3xl font-bold text-gray-900">{convertedSessions || 0}</p>
          <p className="text-sm text-green-600">{conversionRate}% rate</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Active A/B Tests</p>
          <p className="text-3xl font-bold text-gray-900">{abTests?.length || 0}</p>
        </div>
      </div>

      {/* A/B Test Performance */}
      {abTests && abTests.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">A/B Test Performance</h2>
          <div className="space-y-6">
            {abTests.map((test) => {
              const variants = test.variants || []
              return (
                <div key={test.id} className="border-b pb-4 last:border-0">
                  <h3 className="font-medium text-gray-800 mb-3">{test.name}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {variants.map((variant) => {
                      const results = variant.results || []
                      const total = results.length
                      const converted = results.filter((r: { converted: boolean }) => r.converted).length
                      const rate = total > 0 ? ((converted / total) * 100).toFixed(1) : '0'

                      return (
                        <div key={variant.id} className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium">{variant.name}</span>
                            {variant.is_control && (
                              <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
                                Control
                              </span>
                            )}
                          </div>
                          <p className="text-2xl font-bold text-gray-900">{rate}%</p>
                          <p className="text-sm text-gray-500">
                            {converted}/{total} conversions
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Sessions by Funnel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Sessions by Funnel</h2>
          {Object.keys(funnelCounts).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(funnelCounts).map(([id, data]) => (
                <div key={id} className="flex justify-between items-center">
                  <span className="text-gray-700">{data.name}</span>
                  <span className="font-semibold">{data.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No session data yet</p>
          )}
        </div>

        {/* Urgency Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Urgency Bands</h2>
          <div className="space-y-3">
            {['H', 'MH', 'M', 'L'].map((band) => {
              const bandLabels: Record<string, string> = {
                H: 'High',
                MH: 'Medium-High',
                M: 'Medium',
                L: 'Low',
              }
              const bandColors: Record<string, string> = {
                H: 'bg-red-500',
                MH: 'bg-orange-500',
                M: 'bg-yellow-500',
                L: 'bg-green-500',
              }
              return (
                <div key={band} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${bandColors[band]}`} />
                  <span className="text-gray-700 flex-1">{bandLabels[band]}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Recent Sessions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Funnel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Condition
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Urgency
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Converted
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentSessions?.map((session) => (
                <tr key={session.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(session.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {(session.funnels as unknown as { name: string } | null)?.name || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {session.email || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {session.condition_code || '-'}
                  </td>
                  <td className="px-6 py-4">
                    {session.urgency_band && (
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          session.urgency_band === 'H'
                            ? 'bg-red-100 text-red-800'
                            : session.urgency_band === 'MH'
                            ? 'bg-orange-100 text-orange-800'
                            : session.urgency_band === 'M'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {session.urgency_band}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {session.converted ? (
                      <span className="text-green-600">✓</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
