'use client'

import { useState, useEffect } from 'react'
import { BuyboxConfig } from '@/config/schema'

interface BuyboxWidgetProps {
  config: BuyboxConfig
  brandColor: string
  conditionCode: string
}

export default function BuyboxWidget({ config, brandColor, conditionCode }: BuyboxWidgetProps) {
  const [selectedOffer, setSelectedOffer] = useState<'complete' | 'single'>('complete')
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(0)
  const [isSubscription, setIsSubscription] = useState(true)
  const [stockCount, setStockCount] = useState(13)

  const offer = config.offers[selectedOffer]
  const selectedPlan = offer.plans[selectedPlanIndex]

  // Stock countdown effect
  useEffect(() => {
    const interval = setInterval(() => {
      setStockCount(prev => prev > 8 ? prev - 1 : prev)
    }, 20000)
    return () => clearInterval(interval)
  }, [])

  // Build checkout URL
  const buildCheckoutUrl = () => {
    const params = new URLSearchParams()

    if (isSubscription) {
      params.set('id', selectedPlan.variantId)
      params.set('quantity', String(selectedPlan.quantity))
      if (selectedPlan.sellingPlanId) {
        params.set('selling_plan', selectedPlan.sellingPlanId)
      }
    } else {
      params.set('id', offer.tryOnce.variantId)
      params.set('quantity', String(offer.tryOnce.quantity))
    }

    // Add UTM parameters from current URL
    const currentParams = new URLSearchParams(window.location.search)
    currentParams.forEach((value, key) => {
      if (key.startsWith('utm_') || key === 'g' || key === 'u' || key === 's' || key === 'f') {
        params.set(key, value)
      }
    })

    params.set('condition', conditionCode)
    params.set('return_to', '/checkout')

    return `${config.shopOrigin}/cart/add?${params.toString()}`
  }

  const handleCheckout = () => {
    // Fire analytics event
    if (typeof window !== 'undefined') {
      (window as { dataLayer?: Record<string, unknown>[] }).dataLayer = (window as { dataLayer?: Record<string, unknown>[] }).dataLayer || []
      ;(window as { dataLayer?: Record<string, unknown>[] }).dataLayer!.push({
        event: 'redirect_to_cart',
        offer_id: `${selectedOffer}-${isSubscription ? 'sub' : 'once'}`,
        variant_selected: isSubscription ? selectedPlan.variantId : offer.tryOnce.variantId,
        condition: conditionCode,
      })
    }

    window.location.href = buildCheckoutUrl()
  }

  return (
    <div className="px-5 py-6">
      <h3 className="text-xl font-bold text-center mb-4" style={{ color: brandColor }}>
        CHOOSE YOUR SOLUTION
      </h3>

      {/* Offer Tabs */}
      <div className="flex border-4 border-black rounded-full overflow-hidden mb-6">
        <button
          onClick={() => { setSelectedOffer('complete'); setSelectedPlanIndex(0); }}
          className="flex-1 py-3 text-sm font-medium transition-colors"
          style={{
            backgroundColor: selectedOffer === 'complete' ? brandColor : 'white',
            color: selectedOffer === 'complete' ? 'white' : '#333',
          }}
        >
          Complete System
        </button>
        <button
          onClick={() => { setSelectedOffer('single'); setSelectedPlanIndex(0); }}
          className="flex-1 py-3 text-sm font-medium transition-colors"
          style={{
            backgroundColor: selectedOffer === 'single' ? brandColor : 'white',
            color: selectedOffer === 'single' ? 'white' : '#333',
          }}
        >
          Single Solution
        </button>
      </div>

      {/* Product Name */}
      <div className="text-center mb-4">
        <span
          className="inline-block px-4 py-2 rounded-lg text-sm font-semibold"
          style={{
            backgroundColor: `${brandColor}15`,
            color: brandColor,
          }}
        >
          {offer.product}
        </span>
      </div>

      {/* Subscription Box */}
      <div className="border-4 border-black rounded-2xl p-4 mb-4" style={{ boxShadow: '4px 8px 0 #000' }}>
        <div className="flex items-center justify-between mb-4">
          <span className="font-bold text-gray-800">Autoship & Save</span>
          <span className="text-sm font-semibold text-red-600">{stockCount} left in stock.</span>
        </div>

        {/* Plan Options */}
        {offer.plans.map((plan, index) => (
          <button
            key={plan.plan}
            onClick={() => { setSelectedPlanIndex(index); setIsSubscription(true); }}
            className="w-full p-4 rounded-xl mb-2 border-2 transition-all text-left relative"
            style={{
              borderColor: selectedPlanIndex === index && isSubscription ? '#333' : '#ddd',
              backgroundColor: selectedPlanIndex === index && isSubscription ? `${brandColor}15` : 'white',
            }}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="font-bold text-gray-800">{plan.plan}</div>
                <div className="text-lg font-black text-gray-900">{plan.perDay}</div>
                <div className="text-sm text-gray-600">
                  Billed today: <span className="font-semibold">{plan.price}</span>
                  {' '}
                  <span className="text-red-500 line-through">{plan.old}</span>
                </div>
              </div>
              <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                {plan.badge}
              </span>
            </div>
          </button>
        ))}

        {/* Benefits List */}
        <ul className="space-y-2 mt-4 mb-4">
          {[
            selectedOffer === 'complete' ? 'Complete Regimen for Maximum Support' : 'Best Seller: Our Strongest Formula',
            'FREE U.S. shipping today',
            'Pause or cancel anytime',
            '30-day money back guarantee',
          ].map((benefit, i) => (
            <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
              <span className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center text-xs">✓</span>
              {benefit}
            </li>
          ))}
        </ul>

        {/* CTA Button */}
        <button
          onClick={handleCheckout}
          className="w-full py-4 rounded-xl text-white font-bold text-lg border-4 border-black"
          style={{
            backgroundColor: brandColor,
            boxShadow: '2px 4px 0 #000',
          }}
        >
          Start Now
        </button>
      </div>

      {/* Try Once Box */}
      <div className="border-4 border-black rounded-2xl p-4" style={{ boxShadow: '4px 8px 0 #000' }}>
        <div className="flex items-center justify-between mb-4">
          <span className="font-bold text-gray-800">Try Once</span>
          <span className="text-sm font-semibold text-red-600">{stockCount} left in stock.</span>
        </div>

        <button
          onClick={() => setIsSubscription(false)}
          className="w-full p-4 rounded-xl mb-4 border-2 transition-all text-left"
          style={{
            borderColor: !isSubscription ? '#333' : '#ddd',
            backgroundColor: !isSubscription ? `${brandColor}15` : 'white',
          }}
        >
          <div className="text-lg font-black text-gray-900">{offer.tryOnce.perDay}</div>
          <div className="text-sm text-gray-600">
            One-time price: <span className="font-semibold">{offer.tryOnce.price}</span>
            {' '}
            <span className="text-red-500 line-through">{offer.tryOnce.old}</span>
          </div>
        </button>

        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <span className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs">✗</span>
          No FREE shipping
        </div>

        <button
          onClick={() => { setIsSubscription(false); handleCheckout(); }}
          className="w-full py-4 rounded-xl text-white font-bold text-lg border-4 border-black"
          style={{
            backgroundColor: brandColor,
            boxShadow: '2px 4px 0 #000',
          }}
        >
          Try Now
        </button>
      </div>
    </div>
  )
}
