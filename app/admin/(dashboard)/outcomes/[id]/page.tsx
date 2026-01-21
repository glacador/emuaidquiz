'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Condition {
  id: string
  name: string
  slug: string
  code: string
  results_headline: string
  results_intro: string
  results_body: string
  custom_html: string | null
  custom_css: string | null
  hero_image_url: string | null
}

export default function EditOutcomePage() {
  const [condition, setCondition] = useState<Condition | null>(null)
  const [customHtml, setCustomHtml] = useState('')
  const [customCss, setCustomCss] = useState('')
  const [useCustomHtml, setUseCustomHtml] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)

  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const conditionId = params.id as string
  const funnelId = searchParams.get('funnel')
  const supabase = createClient()

  useEffect(() => {
    const fetchCondition = async () => {
      const { data, error } = await supabase
        .from('conditions')
        .select('*')
        .eq('id', conditionId)
        .single()

      if (error) {
        setError('Failed to load condition')
        return
      }

      setCondition(data)
      setCustomHtml(data.custom_html || getDefaultTemplate(data))
      setCustomCss(data.custom_css || '')
      setUseCustomHtml(!!data.custom_html)
    }

    fetchCondition()
  }, [conditionId, supabase])

  const getDefaultTemplate = (cond: Condition) => {
    return `<!-- Outcome Page for ${cond.name} -->
<div class="outcome-page">
  <!-- Hero Section -->
  <div class="hero-section">
    <div class="results-label">YOUR RESULTS</div>
    <h1 class="headline">${cond.results_headline || 'Your Results'}</h1>
    <p class="intro">${cond.results_intro || ''}</p>
  </div>

  <!-- Trust Badges -->
  <div class="trust-badges">
    <span>As featured in: Healthline, NIH, Harvard Health</span>
  </div>

  <!-- Protocol Section -->
  <div class="protocol-section">
    <h3>YOUR PERSONALIZED PROTOCOL</h3>
    <p>Based on your pattern, we've identified a targeted approach.</p>
  </div>

  <!-- Body Content -->
  <div class="body-content">
    ${cond.results_body || ''}
  </div>

  <!-- Stats Section -->
  <div class="stats-grid">
    <div class="stat">
      <div class="stat-value">30</div>
      <div class="stat-label">Day Money Back</div>
    </div>
    <div class="stat">
      <div class="stat-value">45K+</div>
      <div class="stat-label">5-Star Reviews</div>
    </div>
    <div class="stat">
      <div class="stat-value">FDA</div>
      <div class="stat-label">Registered</div>
    </div>
  </div>

  <!-- Buybox will be inserted here automatically -->
  <div id="buybox-container"></div>

  <!-- FAQ Section -->
  <div class="faq-section">
    <h3>Frequently Asked Questions</h3>
    <!-- FAQ items -->
  </div>
</div>`
  }

  const handleSave = async () => {
    if (!condition) return

    setSaving(true)
    setError(null)
    setSuccess(false)

    const { error: updateError } = await supabase
      .from('conditions')
      .update({
        custom_html: useCustomHtml ? customHtml : null,
        custom_css: customCss || null,
      })
      .eq('id', conditionId)

    if (updateError) {
      setError(updateError.message)
      setSaving(false)
      return
    }

    setSuccess(true)
    setSaving(false)
    setTimeout(() => setSuccess(false), 3000)
  }

  const handleReset = () => {
    if (!condition) return
    if (confirm('Reset to default template? Your custom HTML will be lost.')) {
      setCustomHtml(getDefaultTemplate(condition))
      setUseCustomHtml(false)
    }
  }

  if (!condition) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Outcome Page</h1>
          <p className="text-gray-600 mt-1">
            {condition.name} ({condition.code})
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {previewMode ? 'Edit' : 'Preview'}
          </button>
          <button
            onClick={() => router.push(`/admin/outcomes?funnel=${funnelId}`)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Back
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">{error}</div>
      )}

      {success && (
        <div className="bg-green-50 text-green-600 p-4 rounded-lg mb-6">
          Saved successfully!
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor Panel */}
        <div className={previewMode ? 'hidden lg:block' : ''}>
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            {/* Toggle Custom HTML */}
            <div className="flex items-center gap-3 pb-4 border-b">
              <input
                type="checkbox"
                id="useCustomHtml"
                checked={useCustomHtml}
                onChange={(e) => setUseCustomHtml(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <label htmlFor="useCustomHtml" className="font-medium">
                Use Custom HTML
              </label>
            </div>

            {/* HTML Editor */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  HTML Template
                </label>
                <button
                  onClick={handleReset}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Reset to Default
                </button>
              </div>
              <textarea
                value={customHtml}
                onChange={(e) => {
                  setCustomHtml(e.target.value)
                  setUseCustomHtml(true)
                }}
                className="w-full h-96 px-4 py-3 font-mono text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter custom HTML..."
              />
            </div>

            {/* CSS Editor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom CSS (optional)
              </label>
              <textarea
                value={customCss}
                onChange={(e) => setCustomCss(e.target.value)}
                className="w-full h-32 px-4 py-3 font-mono text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder=".outcome-page { ... }"
              />
            </div>

            {/* Available Variables */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Available Template Variables
              </h4>
              <div className="text-xs text-gray-600 font-mono space-y-1">
                <div>{'{{condition_name}}'} - Condition name</div>
                <div>{'{{condition_code}}'} - Condition code</div>
                <div>{'{{headline}}'} - Results headline</div>
                <div>{'{{intro}}'} - Results intro text</div>
                <div>{'{{body}}'} - Results body text</div>
                <div>{'{{urgency_band}}'} - Urgency band (L/M/MH/H)</div>
                <div>{'{{brand_color}}'} - Brand color hex</div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className={!previewMode ? 'hidden lg:block' : ''}>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="bg-gray-100 px-4 py-2 border-b flex items-center gap-2">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span className="ml-2 text-sm text-gray-600">Preview</span>
            </div>
            <div className="p-4 max-h-[600px] overflow-auto">
              {customCss && <style>{customCss}</style>}
              <div
                dangerouslySetInnerHTML={{ __html: customHtml }}
                className="outcome-preview"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
