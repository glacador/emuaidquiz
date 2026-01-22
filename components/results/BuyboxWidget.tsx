'use client'

import { useState, useEffect } from 'react'

interface BuyboxWidgetProps {
  config: unknown // Keep for compatibility but not used
  brandColor: string // Keep for compatibility but not used
  conditionCode: string
}

export default function BuyboxWidget({ conditionCode }: BuyboxWidgetProps) {
  const [currentOffer, setCurrentOffer] = useState<'complete' | 'single'>('complete')
  const [selectedPlanIndex, setSelectedPlanIndex] = useState<{ complete: number; single: number }>({ complete: 0, single: 0 })
  const [stockComplete, setStockComplete] = useState(13)
  const [stockSingle, setStockSingle] = useState(37)

  const MIN_COMPLETE = 8
  const MIN_SINGLE = 19

  // Offer data for cart links
  const offerData = {
    complete: {
      plans: [
        {
          link: "https://www.emuaid.com/cart/add?id=45837515456701&quantity=1&selling_plan=2487943357&return_to=/checkout",
          offerId: "cta-complete-one",
          variantId: "45837515456701",
          sellingPlanId: "2389213373",
          quantity: 1
        },
        {
          link: "https://www.emuaid.com/cart/add?id=45839654486205&selling_plan=2487910589&return_to=/checkout",
          offerId: "cta-complete-two",
          variantId: "45837468074173",
          sellingPlanId: "2389213373",
          quantity: 2
        }
      ],
      try: {
        link: "https://www.emuaid.com/cart/add?id=39278541734077&quantity=1&return_to=/checkout",
        offerId: "try-complete",
        variantId: "39278541734077",
        quantity: 1
      }
    },
    single: {
      plans: [
        {
          link: "https://www.emuaid.com/cart/add?id=45839698100413&return_to=/checkout",
          offerId: "cta-single-one",
          variantId: "45837555237053",
          sellingPlanId: "1485406397",
          quantity: 1
        },
        {
          link: "https://www.emuaid.com/cart/add?id=45839691710653&&return_to=/checkout",
          offerId: "cta-single-two",
          variantId: "45837569786045",
          sellingPlanId: "1485406397",
          quantity: 2
        }
      ],
      try: {
        link: "https://www.emuaid.com/cart/add?id=39278514045117&quantity=1",
        offerId: "try-single",
        variantId: "39278514045117",
        quantity: 1
      }
    }
  }

  // Stock countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setStockComplete(prev => prev > MIN_COMPLETE ? prev - 1 : prev)
      setStockSingle(prev => prev > MIN_SINGLE ? prev - 1 : prev)
    }, 20000)
    return () => clearInterval(interval)
  }, [])

  // UTM helpers
  const getWorkingUTMs = () => {
    const KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"]
    const url = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
    const stored = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem("last_utms") : null
    const storedParams = stored ? new URLSearchParams(stored) : new URLSearchParams()
    const out = new URLSearchParams()

    KEYS.forEach(k => {
      const v = url.get(k) || storedParams.get(k)
      if (v) out.set(k, v)
    })

    if (![...out.keys()].length) {
      out.set("utm_source", "framer")
      out.set("utm_medium", "internal")
      out.set("utm_campaign", "rescue_kit")
    }

    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem("last_utms", out.toString())
    }
    return out
  }

  const mergeUTMsIntoUrl = (rawHref: string, overrides?: Record<string, string>) => {
    const u = new URL(rawHref, "https://www.emuaid.com")
    const current = getWorkingUTMs()
    const merged = new URLSearchParams(u.search)

    current.forEach((v, k) => merged.set(k, v))
    if (overrides) {
      Object.entries(overrides).forEach(([k, v]) => v && merged.set(k, v))
    }
    if (!merged.get("click_id")) {
      merged.set("click_id", Math.random().toString(36).slice(2))
    }
    merged.set("condition", conditionCode)

    u.search = merged.toString()
    return u.toString()
  }

  const fireRedirectToCart = (offerId: string, variantId: string) => {
    try {
      const search = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
      if (typeof window !== 'undefined') {
        (window as { dataLayer?: unknown[] }).dataLayer = (window as { dataLayer?: unknown[] }).dataLayer || []
        ;(window as { dataLayer?: unknown[] }).dataLayer!.push({
          event: "redirect_to_cart",
          offer_id: offerId,
          variant_selected: variantId,
          cond: search.get("cond"),
          urgency_band: search.get("urgency") || search.get("urg"),
          segment_code: search.get("seg") || search.get("segment_code"),
          click_id: search.get("click_id")
        })
      }
    } catch (e) {
      console.warn("redirect_to_cart push failed", e)
    }
  }

  const selectOffer = (offer: 'complete' | 'single') => {
    setCurrentOffer(offer)
  }

  const selectPlan = (offer: 'complete' | 'single', index: number) => {
    setSelectedPlanIndex(prev => ({ ...prev, [offer]: index }))
  }

  const handleCTA = (offer: 'complete' | 'single') => {
    const plan = offerData[offer].plans[selectedPlanIndex[offer]]
    const utmContent = `cta-${offer}-${plan.quantity === 1 ? 'one' : 'two'}`
    const fallbackUrl = mergeUTMsIntoUrl(plan.link, { utm_content: utmContent })

    fireRedirectToCart(plan.offerId, plan.variantId)
    window.location.href = fallbackUrl
  }

  const handleTry = (offer: 'complete' | 'single') => {
    const tryData = offerData[offer].try
    const fallbackUrl = mergeUTMsIntoUrl(tryData.link, { utm_content: `try-${offer}` })

    fireRedirectToCart(tryData.offerId, tryData.variantId)
    window.location.href = fallbackUrl
  }

  const CheckIcon = () => (
    <svg className="w-[22px] h-[22px] mr-2 flex-shrink-0" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="11" r="11" fill="#22CC66"/>
      <path d="M6.5 11.5L10 15L15.5 8.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )

  const CrossIcon = () => (
    <svg className="w-[22px] h-[22px] mr-2 flex-shrink-0" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="11" r="11" fill="#B80C2A"/>
      <path d="M7 7L15 15M15 7L7 15" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )

  return (
    <div className="flex justify-center py-6 px-4">
      <div className="w-full max-w-[370px] bg-white rounded-3xl shadow-lg overflow-visible relative">
        {/* Title */}
        <div
          className="font-extrabold text-2xl text-center tracking-tight my-6 transition-colors"
          style={{ color: currentOffer === 'complete' ? '#0033A0' : '#B80C2A' }}
        >
          CHOOSE YOUR SOLUTION
        </div>

        {/* Tabs */}
        <div className="flex border-4 border-black rounded-full overflow-hidden w-full max-w-[350px] mx-auto mb-5 h-12 bg-white">
          <button
            onClick={() => selectOffer('complete')}
            className="flex-1 h-full font-medium text-base border-none outline-none cursor-pointer transition-all"
            style={{
              backgroundColor: currentOffer === 'complete' ? '#0033A0' : '#fff',
              color: currentOffer === 'complete' ? '#fff' : '#111'
            }}
          >
            Complete System
          </button>
          <button
            onClick={() => selectOffer('single')}
            className="flex-1 h-full font-medium text-base border-none outline-none cursor-pointer transition-all"
            style={{
              backgroundColor: currentOffer === 'single' ? '#B80C2A' : '#fff',
              color: currentOffer === 'single' ? '#fff' : '#111'
            }}
          >
            Single Solution
          </button>
        </div>

        {/* Split Screen Product Images */}
        <div className="w-full flex justify-center mb-3 px-2 gap-0">
          {/* Left: Complete System */}
          <div
            className="flex-1 cursor-pointer relative max-w-[175px] rounded-l-2xl overflow-hidden hover:opacity-95"
            onClick={() => selectOffer('complete')}
          >
            <img
              src={currentOffer === 'complete'
                ? "https://raw.githubusercontent.com/glacador/emuaidquiz/a5419145d9628cd76514298f8b5c0adf8f5de978/public/1clicked.png"
                : "https://raw.githubusercontent.com/glacador/emuaidquiz/a5419145d9628cd76514298f8b5c0adf8f5de978/public/1notclicked.png"
              }
              alt="Complete System"
              className="w-full h-auto"
            />
          </div>
          {/* Right: Single Solution */}
          <div
            className="flex-1 cursor-pointer relative max-w-[175px] rounded-r-2xl overflow-hidden hover:opacity-95"
            onClick={() => selectOffer('single')}
          >
            <img
              src={currentOffer === 'single'
                ? "https://raw.githubusercontent.com/glacador/emuaidquiz/a5419145d9628cd76514298f8b5c0adf8f5de978/public/2clicked.png"
                : "https://raw.githubusercontent.com/glacador/emuaidquiz/a5419145d9628cd76514298f8b5c0adf8f5de978/public/2notclicked.png"
              }
              alt="Single Solution"
              className="w-full h-auto"
            />
          </div>
        </div>

        {/* Complete System Content */}
        {currentOffer === 'complete' && (
          <>
            {/* Autoship Box */}
            <div className="border-4 border-black rounded-3xl mx-2 mt-5 bg-white pb-[18px] relative" style={{ boxShadow: '4px 8px 0 #000' }}>
              <div className="font-bold text-lg mt-[18px] mb-2 ml-4 text-gray-900 flex items-center gap-2">
                <span>Autoship & Save</span>
                <span className="text-sm font-bold text-red-700">{stockComplete} left in stock.</span>
              </div>

              {/* One Person Plan */}
              <div
                onClick={() => selectPlan('complete', 0)}
                className="rounded-xl mx-3 mb-2 p-3 flex items-center justify-between relative cursor-pointer transition-all"
                style={{
                  border: selectedPlanIndex.complete === 0 ? '3px solid #111' : '2px solid #bbb',
                  background: selectedPlanIndex.complete === 0 ? '#ccd8e8' : '#fff'
                }}
              >
                <div>
                  <div className="font-bold text-base text-gray-900 mb-0.5">One Person</div>
                  <div className="font-black text-[19px] text-gray-900 leading-tight">$2.63 Per Day</div>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="font-bold text-sm text-gray-900">Billed today: $80.49</span>
                    <span className="font-semibold text-[13px] text-red-600 line-through">$146.34</span>
                  </div>
                </div>
                <div className="absolute top-2.5 right-3 bg-green-500 text-white font-bold text-[13px] rounded-full px-2.5 py-0.5 min-w-[48px] text-center">45% off</div>
              </div>

              {/* Two People Plan */}
              <div
                onClick={() => selectPlan('complete', 1)}
                className="rounded-xl mx-3 mb-2 p-3 flex items-center justify-between relative cursor-pointer transition-all"
                style={{
                  border: selectedPlanIndex.complete === 1 ? '3px solid #111' : '2px solid #bbb',
                  background: selectedPlanIndex.complete === 1 ? '#ccd8e8' : '#fff'
                }}
              >
                <div>
                  <div className="font-bold text-base text-gray-900 mb-0.5">Two People</div>
                  <div className="font-black text-[19px] text-gray-900 leading-tight">$2.56 Per Day</div>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="font-bold text-sm text-gray-900">Billed today: $153.90</span>
                    <span className="font-semibold text-[13px] text-red-600 line-through">$292.68</span>
                  </div>
                </div>
                <div className="absolute top-2.5 right-3 bg-green-500 text-white font-bold text-[13px] rounded-full px-2.5 py-0.5 min-w-[48px] text-center">47% off</div>
              </div>

              {/* Bullets */}
              <ul className="list-none p-0 mt-3 ml-4">
                <li className="flex items-center font-medium text-sm text-gray-900 mb-1"><CheckIcon />Complete Regimen for Maximum Support</li>
                <li className="flex items-center font-medium text-sm text-gray-900 mb-1"><CheckIcon />FREE U.S. shipping today</li>
                <li className="flex items-center font-medium text-sm text-gray-900 mb-1"><CheckIcon />Pause or cancel anytime</li>
                <li className="flex items-center font-medium text-sm text-gray-900 mb-1"><CheckIcon />30-day money back guarantee</li>
              </ul>

              {/* CTA */}
              <div className="flex justify-center mt-[18px]">
                <button
                  onClick={() => handleCTA('complete')}
                  className="w-full max-w-[320px] h-10 text-white font-extrabold text-lg rounded-3xl border-4 border-black cursor-pointer transition-transform hover:-translate-y-px active:translate-y-px"
                  style={{ backgroundColor: '#0033A0', boxShadow: '2px 4px 0 #000' }}
                >
                  Start Now
                </button>
              </div>
            </div>

            {/* Try Once Box */}
            <div className="border-4 border-black rounded-3xl mx-2 mt-6 bg-white pb-[18px] relative" style={{ boxShadow: '4px 8px 0 #000' }}>
              <div className="font-bold text-lg mt-[18px] mb-2 ml-4 text-gray-900 flex items-center gap-2">
                <span>Try Once</span>
                <span className="text-sm font-bold text-red-700">{stockComplete} left in stock.</span>
              </div>
              <div className="font-black text-[19px] text-gray-900 mx-3 leading-tight">$2.96 Per Day</div>
              <div className="flex items-baseline gap-2.5 mt-0.5 mx-3">
                <span className="font-bold text-sm text-gray-900">One-time price: $88.90</span>
                <span className="font-semibold text-[13px] text-red-600 line-through">$146.34</span>
              </div>
              <div className="border-t-2 border-gray-900 mx-3 mt-3"></div>
              <div className="flex items-center mt-3 ml-4 font-medium text-sm text-gray-900">
                <CrossIcon />
                No FREE shipping
              </div>
              <div className="flex justify-center mt-[18px]">
                <button
                  onClick={() => handleTry('complete')}
                  className="w-full max-w-[320px] h-10 text-white font-extrabold text-lg rounded-3xl border-4 border-black cursor-pointer transition-transform hover:-translate-y-px active:translate-y-px"
                  style={{ backgroundColor: '#0033A0', boxShadow: '2px 4px 0 #000' }}
                >
                  Try Now
                </button>
              </div>
            </div>
          </>
        )}

        {/* Single Solution Content */}
        {currentOffer === 'single' && (
          <>
            {/* Autoship Box */}
            <div className="border-4 border-black rounded-3xl mx-2 mt-5 bg-white pb-[18px] relative" style={{ boxShadow: '4px 8px 0 #000' }}>
              <div className="font-bold text-lg mt-[18px] mb-2 ml-4 text-gray-900 flex items-center gap-2">
                <span>Autoship & Save</span>
                <span className="text-sm font-bold text-red-700">{stockSingle} left in stock.</span>
              </div>

              {/* One Person Plan */}
              <div
                onClick={() => selectPlan('single', 0)}
                className="rounded-xl mx-3 mb-2 p-3 flex items-center justify-between relative cursor-pointer transition-all"
                style={{
                  border: selectedPlanIndex.single === 0 ? '3px solid #111' : '2px solid #bbb',
                  background: selectedPlanIndex.single === 0 ? '#f792a0' : '#fff'
                }}
              >
                <div>
                  <div className="font-bold text-base text-gray-900 mb-0.5">One Person</div>
                  <div className="font-black text-[19px] text-gray-900 leading-tight">$1.89 Per Day</div>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="font-bold text-sm text-gray-900">Billed today: $56.70</span>
                    <span className="font-semibold text-[13px] text-red-600 line-through">$80</span>
                  </div>
                </div>
                <div className="absolute top-2.5 right-3 bg-green-500 text-white font-bold text-[13px] rounded-full px-2.5 py-0.5 min-w-[48px] text-center">29% off</div>
              </div>

              {/* Two People Plan */}
              <div
                onClick={() => selectPlan('single', 1)}
                className="rounded-xl mx-3 mb-2 p-3 flex items-center justify-between relative cursor-pointer transition-all"
                style={{
                  border: selectedPlanIndex.single === 1 ? '3px solid #111' : '2px solid #bbb',
                  background: selectedPlanIndex.single === 1 ? '#f792a0' : '#fff'
                }}
              >
                <div>
                  <div className="font-bold text-base text-gray-900 mb-0.5">Two People</div>
                  <div className="font-black text-[19px] text-gray-900 leading-tight">$1.53 Per Day</div>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="font-bold text-sm text-gray-900">Billed today: $92.10</span>
                    <span className="font-semibold text-[13px] text-red-600 line-through">$160</span>
                  </div>
                </div>
                <div className="absolute top-2.5 right-3 bg-green-500 text-white font-bold text-[13px] rounded-full px-2.5 py-0.5 min-w-[48px] text-center">42% off</div>
              </div>

              {/* Bullets */}
              <ul className="list-none p-0 mt-3 ml-4">
                <li className="flex items-center font-medium text-sm text-gray-900 mb-1"><CheckIcon />Best Seller: Our Strongest Formula</li>
                <li className="flex items-center font-medium text-sm text-gray-900 mb-1"><CheckIcon />FREE U.S. shipping today</li>
                <li className="flex items-center font-medium text-sm text-gray-900 mb-1"><CheckIcon />Pause or cancel anytime</li>
                <li className="flex items-center font-medium text-sm text-gray-900 mb-1"><CheckIcon />30-day money back guarantee</li>
              </ul>

              {/* CTA */}
              <div className="flex justify-center mt-[18px]">
                <button
                  onClick={() => handleCTA('single')}
                  className="w-full max-w-[320px] h-10 text-white font-extrabold text-lg rounded-3xl border-4 border-black cursor-pointer transition-transform hover:-translate-y-px active:translate-y-px"
                  style={{ backgroundColor: '#B80C2A', boxShadow: '2px 4px 0 #000' }}
                >
                  Start Now
                </button>
              </div>
            </div>

            {/* Try Once Box */}
            <div className="border-4 border-black rounded-3xl mx-2 mt-6 bg-white pb-[18px] relative" style={{ boxShadow: '4px 8px 0 #000' }}>
              <div className="font-bold text-lg mt-[18px] mb-2 ml-4 text-gray-900 flex items-center gap-2">
                <span>Try Once</span>
                <span className="text-sm font-bold text-red-700">{stockSingle} left in stock.</span>
              </div>
              <div className="font-black text-[19px] text-gray-900 mx-3 leading-tight">$2.13 Per Day</div>
              <div className="flex items-baseline gap-2.5 mt-0.5 mx-3">
                <span className="font-bold text-sm text-gray-900">One-time price: $63.90</span>
                <span className="font-semibold text-[13px] text-red-600 line-through">$80.00</span>
              </div>
              <div className="border-t-2 border-gray-900 mx-3 mt-3"></div>
              <div className="flex items-center mt-3 ml-4 font-medium text-sm text-gray-900">
                <CrossIcon />
                No FREE shipping
              </div>
              <div className="flex justify-center mt-[18px]">
                <button
                  onClick={() => handleTry('single')}
                  className="w-full max-w-[320px] h-10 text-white font-extrabold text-lg rounded-3xl border-4 border-black cursor-pointer transition-transform hover:-translate-y-px active:translate-y-px"
                  style={{ backgroundColor: '#B80C2A', boxShadow: '2px 4px 0 #000' }}
                >
                  Try Now
                </button>
              </div>
            </div>
          </>
        )}

        {/* Bottom padding */}
        <div className="h-6"></div>
      </div>
    </div>
  )
}
