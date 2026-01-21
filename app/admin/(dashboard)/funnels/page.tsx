import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function FunnelsPage() {
  const supabase = await createClient()

  const { data: funnels, error } = await supabase
    .from('funnels')
    .select(`
      *,
      conditions:conditions(count),
      questions:questions(count)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching funnels:', error)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Funnels</h1>
        <Link
          href="/admin/funnels/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + New Funnel
        </Link>
      </div>

      {funnels && funnels.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Funnel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Domain
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Conditions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Questions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {funnels.map((funnel) => (
                <tr key={funnel.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: funnel.brand_color }}
                      >
                        {funnel.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{funnel.name}</p>
                        <p className="text-sm text-gray-500">{funnel.tagline}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {funnel.domain || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {(funnel.conditions as { count: number }[])?.[0]?.count || 0}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {(funnel.questions as { count: number }[])?.[0]?.count || 0}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/funnels/${funnel.id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/admin/questions?funnel=${funnel.id}`}
                        className="text-green-600 hover:text-green-800 text-sm"
                      >
                        Questions
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <p className="text-gray-500 mb-4">No funnels yet. Create your first funnel to get started.</p>
          <Link
            href="/admin/funnels/new"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Create Funnel
          </Link>
        </div>
      )}
    </div>
  )
}
