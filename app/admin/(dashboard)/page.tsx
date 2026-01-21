import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminDashboard() {
  let stats = [
    { label: 'Total Funnels', value: 0, icon: '🎯', href: '/admin/funnels' },
    { label: 'Total Questions', value: 0, icon: '❓', href: '/admin/questions' },
    { label: 'Active A/B Tests', value: 0, icon: '🧪', href: '/admin/ab-tests' },
    { label: 'Quiz Sessions', value: 0, icon: '📊', href: '/admin/analytics' },
  ]
  let dbError: string | null = null

  try {
    const supabase = await createClient()

    // Fetch stats
    const [funnelRes, questionRes, testRes, sessionRes] = await Promise.all([
      supabase.from('funnels').select('*', { count: 'exact', head: true }),
      supabase.from('questions').select('*', { count: 'exact', head: true }),
      supabase.from('ab_tests').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('quiz_sessions').select('*', { count: 'exact', head: true }),
    ])

    // Check for errors
    if (funnelRes.error || questionRes.error || testRes.error || sessionRes.error) {
      throw new Error('Database query failed')
    }

    stats = [
      { label: 'Total Funnels', value: funnelRes.count || 0, icon: '🎯', href: '/admin/funnels' },
      { label: 'Total Questions', value: questionRes.count || 0, icon: '❓', href: '/admin/questions' },
      { label: 'Active A/B Tests', value: testRes.count || 0, icon: '🧪', href: '/admin/ab-tests' },
      { label: 'Quiz Sessions', value: sessionRes.count || 0, icon: '📊', href: '/admin/analytics' },
    ]
  } catch (e) {
    console.error('Dashboard error:', e)
    dbError = 'Unable to connect to database. Please run the SQL migrations in Supabase.'
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      {dbError && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
          <p className="text-yellow-800">{dbError}</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <span className="text-3xl">{stat.icon}</span>
              <div>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/admin/funnels/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            + New Funnel
          </Link>
          <Link
            href="/admin/ab-tests/new"
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            + New A/B Test
          </Link>
          <Link
            href="/admin/analytics"
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            View Analytics
          </Link>
        </div>
      </div>
    </div>
  )
}
