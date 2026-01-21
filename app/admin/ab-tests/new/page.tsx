'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Funnel {
  id: string
  name: string
}

interface Variant {
  name: string
  weight: number
  is_control: boolean
  config: {
    brandColor?: string
    brandColorLight?: string
    brandColorBg?: string
    headlineText?: string
    ctaText?: string
  }
}

export default function NewABTestPage() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [funnelId, setFunnelId] = useState('')
  const [testType, setTestType] = useState<'theme' | 'copy' | 'layout' | 'offer'>('theme')
  const [variants, setVariants] = useState<Variant[]>([
    { name: 'Control', weight: 50, is_control: true, config: {} },
    { name: 'Variant A', weight: 50, is_control: false, config: {} },
  ])
  const [funnels, setFunnels] = useState<Funnel[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchFunnels = async () => {
      const { data } = await supabase.from('funnels').select('id, name').order('name')
      if (data) setFunnels(data)
    }
    fetchFunnels()
  }, [supabase])

  const addVariant = () => {
    setVariants([
      ...variants,
      {
        name: `Variant ${String.fromCharCode(65 + variants.length - 1)}`,
        weight: 0,
        is_control: false,
        config: {},
      },
    ])
  }

  const removeVariant = (index: number) => {
    if (variants.length <= 2) return
    setVariants(variants.filter((_, i) => i !== index))
  }

  const updateVariant = (index: number, updates: Partial<Variant>) => {
    setVariants(variants.map((v, i) => (i === index ? { ...v, ...updates } : v)))
  }

  const updateVariantConfig = (index: number, key: string, value: string) => {
    setVariants(
      variants.map((v, i) =>
        i === index ? { ...v, config: { ...v.config, [key]: value } } : v
      )
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !funnelId) {
      setError('Please fill in all required fields')
      return
    }

    // Validate weights sum to 100
    const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0)
    if (totalWeight !== 100) {
      setError('Variant weights must sum to 100%')
      return
    }

    setSaving(true)
    setError(null)

    // Create test
    const { data: test, error: testError } = await supabase
      .from('ab_tests')
      .insert({
        name,
        description,
        funnel_id: funnelId,
        test_type: testType,
        status: 'draft',
      })
      .select()
      .single()

    if (testError) {
      setError(testError.message)
      setSaving(false)
      return
    }

    // Create variants
    const { error: variantError } = await supabase.from('ab_test_variants').insert(
      variants.map((v) => ({
        test_id: test.id,
        name: v.name,
        weight: v.weight,
        is_control: v.is_control,
        config: v.config,
      }))
    )

    if (variantError) {
      setError(variantError.message)
      setSaving(false)
      return
    }

    router.push('/admin/ab-tests')
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Create A/B Test</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
        )}

        {/* Basic Info */}
        <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Test Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Outcome Page Theme Test"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={2}
              placeholder="What are you testing?"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Funnel *
              </label>
              <select
                value={funnelId}
                onChange={(e) => setFunnelId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select funnel...</option>
                {funnels.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Test Type *
              </label>
              <select
                value={testType}
                onChange={(e) => setTestType(e.target.value as typeof testType)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="theme">Theme (Colors)</option>
                <option value="copy">Copy (Headlines)</option>
                <option value="layout">Layout</option>
                <option value="offer">Offer</option>
              </select>
            </div>
          </div>
        </div>

        {/* Variants */}
        <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Variants</h2>
            <button
              type="button"
              onClick={addVariant}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              + Add Variant
            </button>
          </div>

          <div className="space-y-4">
            {variants.map((variant, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-4 mb-4">
                  <input
                    type="text"
                    value={variant.name}
                    onChange={(e) => updateVariant(index, { name: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Variant name"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={variant.weight}
                      onChange={(e) =>
                        updateVariant(index, { weight: parseInt(e.target.value) || 0 })
                      }
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg"
                      min="0"
                      max="100"
                    />
                    <span className="text-gray-500">%</span>
                  </div>
                  {variant.is_control ? (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                      Control
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => removeVariant(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {/* Theme config fields */}
                {testType === 'theme' && !variant.is_control && (
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Brand Color
                      </label>
                      <input
                        type="color"
                        value={variant.config.brandColor || '#0066CC'}
                        onChange={(e) =>
                          updateVariantConfig(index, 'brandColor', e.target.value)
                        }
                        className="w-full h-10 rounded cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Light Color
                      </label>
                      <input
                        type="color"
                        value={variant.config.brandColorLight || '#3388DD'}
                        onChange={(e) =>
                          updateVariantConfig(index, 'brandColorLight', e.target.value)
                        }
                        className="w-full h-10 rounded cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Background
                      </label>
                      <input
                        type="color"
                        value={variant.config.brandColorBg || '#f0f5ff'}
                        onChange={(e) =>
                          updateVariantConfig(index, 'brandColorBg', e.target.value)
                        }
                        className="w-full h-10 rounded cursor-pointer"
                      />
                    </div>
                  </div>
                )}

                {/* Copy config fields */}
                {testType === 'copy' && !variant.is_control && (
                  <div className="space-y-3 pt-4 border-t">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Headline Override
                      </label>
                      <input
                        type="text"
                        value={variant.config.headlineText || ''}
                        onChange={(e) =>
                          updateVariantConfig(index, 'headlineText', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="Leave blank to use default"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        CTA Text Override
                      </label>
                      <input
                        type="text"
                        value={variant.config.ctaText || ''}
                        onChange={(e) =>
                          updateVariantConfig(index, 'ctaText', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="Leave blank to use default"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <p className="text-sm text-gray-500">
            Total weight: {variants.reduce((sum, v) => sum + v.weight, 0)}% (must equal 100%)
          </p>
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Creating...' : 'Create Test'}
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
