'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface Variant {
  id: string
  name: string
  weight: number
  is_control: boolean
  results: { count: number }[]
}

interface ABTest {
  id: string
  name: string
  description: string | null
  status: 'draft' | 'active' | 'paused' | 'completed'
  test_type: string
  start_date: string | null
  funnel: { id: string; name: string } | null
  variants: Variant[]
}

interface ABTestCardProps {
  test: ABTest
}

export default function ABTestCard({ test }: ABTestCardProps) {
  const [status, setStatus] = useState(test.status)
  const [updating, setUpdating] = useState(false)
  const supabase = createClient()

  const totalSessions = test.variants.reduce(
    (sum, v) => sum + (v.results?.[0]?.count || 0),
    0
  )

  const updateStatus = async (newStatus: 'active' | 'paused' | 'completed') => {
    setUpdating(true)
    const { error } = await supabase
      .from('ab_tests')
      .update({
        status: newStatus,
        start_date: newStatus === 'active' && !test.start_date ? new Date().toISOString() : test.start_date,
        end_date: newStatus === 'completed' ? new Date().toISOString() : null,
      })
      .eq('id', test.id)

    if (!error) {
      setStatus(newStatus)
    }
    setUpdating(false)
  }

  const getStatusColor = () => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      case 'paused': return 'bg-orange-100 text-orange-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-gray-900">{test.name}</h3>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor()}`}>
              {status}
            </span>
          </div>
          {test.description && (
            <p className="text-sm text-gray-500">{test.description}</p>
          )}
          <div className="flex gap-4 mt-2 text-sm text-gray-500">
            <span>Type: {test.test_type}</span>
            <span>Funnel: {test.funnel?.name || 'N/A'}</span>
            <span>Sessions: {totalSessions}</span>
          </div>
        </div>

        <div className="flex gap-2">
          {status === 'draft' && (
            <button
              onClick={() => updateStatus('active')}
              disabled={updating}
              className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              Start
            </button>
          )}
          {status === 'active' && (
            <>
              <button
                onClick={() => updateStatus('paused')}
                disabled={updating}
                className="px-3 py-1 text-sm bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50"
              >
                Pause
              </button>
              <button
                onClick={() => updateStatus('completed')}
                disabled={updating}
                className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
              >
                End
              </button>
            </>
          )}
          {status === 'paused' && (
            <button
              onClick={() => updateStatus('active')}
              disabled={updating}
              className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              Resume
            </button>
          )}
          <Link
            href={`/admin/ab-tests/${test.id}`}
            className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
          >
            Edit
          </Link>
        </div>
      </div>

      {/* Variants */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Variants</h4>
        <div className="space-y-2">
          {test.variants.map((variant) => {
            const sessions = variant.results?.[0]?.count || 0
            const percentage = totalSessions > 0 ? (sessions / totalSessions) * 100 : 0

            return (
              <div key={variant.id} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{variant.name}</span>
                    {variant.is_control && (
                      <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
                        Control
                      </span>
                    )}
                    <span className="text-sm text-gray-500">
                      ({variant.weight}% weight)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-500 w-20">
                      {sessions} sessions
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
