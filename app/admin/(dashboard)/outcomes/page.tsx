import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

interface PageProps {
  searchParams: Promise<{ funnel?: string }>
}

export default async function OutcomesPage({ searchParams }: PageProps) {
  const { funnel: funnelId } = await searchParams

  let funnels: { id: string; name: string }[] = []
  let conditions: {
    id: string
    name: string
    slug: string
    code: string
    custom_html: string | null
  }[] = []
  let error: string | null = null

  // Check if Supabase is configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
    error = 'Supabase is not configured. Please set environment variables in Vercel.'
  } else {
    try {
      const supabase = await createClient()

      const { data: funnelData, error: funnelError } = await supabase
        .from('funnels')
        .select('id, name')
        .order('name')

      if (funnelError) throw funnelError
      funnels = funnelData || []

      if (funnelId) {
        const { data: conditionData, error: conditionError } = await supabase
          .from('conditions')
          .select('id, name, slug, code, custom_html')
          .eq('funnel_id', funnelId)
          .order('sort_order')

        if (conditionError) throw conditionError
        conditions = conditionData || []
      }
    } catch (e) {
      console.error('Database error:', e)
      error = 'Unable to connect to database. Make sure Supabase is configured.'
    }
  }

  if (error) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Outcome Pages</h1>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Outcome Pages</h1>
      </div>

      {/* Funnel Selector */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Funnel
        </label>
        <select
          defaultValue={funnelId || ''}
          onChange={(e) => {
            if (e.target.value) {
              window.location.href = `/admin/outcomes?funnel=${e.target.value}`
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
      </div>

      {/* Conditions List */}
      {funnelId ? (
        conditions.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Condition
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Slug
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Custom HTML
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {conditions.map((condition) => (
                  <tr key={condition.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{condition.name}</div>
                      <div className="text-sm text-gray-500">Code: {condition.code}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      /{condition.slug}
                    </td>
                    <td className="px-6 py-4">
                      {condition.custom_html ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                          Customized
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                          Default
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/outcomes/${condition.id}?funnel=${funnelId}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Edit HTML
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <p className="text-gray-500">
              No conditions found for this funnel. Create conditions first in the Funnels section.
            </p>
          </div>
        )
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <p className="text-gray-500">Select a funnel to manage outcome page HTML.</p>
        </div>
      )}
    </div>
  )
}
