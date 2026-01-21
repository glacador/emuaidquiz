'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function NewFunnelPage() {
  const [name, setName] = useState('')
  const [tagline, setTagline] = useState('')
  const [domain, setDomain] = useState('')
  const [brandColor, setBrandColor] = useState('#0066CC')
  const [brandColorLight, setBrandColorLight] = useState('#3388DD')
  const [brandColorBg, setBrandColorBg] = useState('#f0f5ff')
  const [hookHeadline, setHookHeadline] = useState('')
  const [hookSubheadline, setHookSubheadline] = useState('')
  const [hookStat, setHookStat] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name) {
      setError('Funnel name is required')
      return
    }

    setSaving(true)
    setError(null)

    const { error: insertError } = await supabase.from('funnels').insert({
      name,
      tagline,
      domain: domain || null,
      brand_color: brandColor,
      brand_color_light: brandColorLight,
      brand_color_bg: brandColorBg,
      hook_headline: hookHeadline,
      hook_subheadline: hookSubheadline,
      hook_stat: hookStat,
    })

    if (insertError) {
      setError(insertError.message)
      setSaving(false)
      return
    }

    router.push('/admin/funnels')
    router.refresh()
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Funnel</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
        )}

        {/* Basic Info */}
        <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Funnel Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., AcneScope"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tagline
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Acne Skin Assessment"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Domain
            </label>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., acnescope.com"
            />
          </div>
        </div>

        {/* Brand Colors */}
        <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Brand Colors</h2>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Primary Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="w-12 h-10 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Light Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={brandColorLight}
                  onChange={(e) => setBrandColorLight(e.target.value)}
                  className="w-12 h-10 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={brandColorLight}
                  onChange={(e) => setBrandColorLight(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Background
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={brandColorBg}
                  onChange={(e) => setBrandColorBg(e.target.value)}
                  className="w-12 h-10 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={brandColorBg}
                  onChange={(e) => setBrandColorBg(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div
            className="p-4 rounded-lg mt-4"
            style={{ backgroundColor: brandColorBg }}
          >
            <p className="text-sm" style={{ color: brandColor }}>
              Preview: This is how your brand colors will look
            </p>
          </div>
        </div>

        {/* Hook Content */}
        <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Hook Content</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Headline
            </label>
            <input
              type="text"
              value={hookHeadline}
              onChange={(e) => setHookHeadline(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Your Acne Treatment Might Be Making It Worse."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subheadline
            </label>
            <input
              type="text"
              value={hookSubheadline}
              onChange={(e) => setHookSubheadline(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 68% of 'Acne' Cases Aren't Actually Acne."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stat (for display)
            </label>
            <input
              type="text"
              value={hookStat}
              onChange={(e) => setHookStat(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 68%"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Creating...' : 'Create Funnel'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
