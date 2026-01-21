'use client'

import { useState } from 'react'

interface EmailCaptureProps {
  onSubmit: (email: string, firstName?: string) => void
  onSkip: () => void
  brandColor: string
  zerobounceEndpoint?: string
}

export default function EmailCapture({
  onSubmit,
  onSkip,
  brandColor,
  zerobounceEndpoint,
}: EmailCaptureProps) {
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [error, setError] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)

  const validateEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)

  const handleSubmit = async () => {
    if (!email) {
      setError('Please enter your email')
      return
    }
    if (!validateEmail(email)) {
      setError('Please enter a valid email')
      return
    }

    setError('')
    setIsVerifying(true)

    // Optional ZeroBounce validation
    if (zerobounceEndpoint) {
      try {
        const res = await fetch(zerobounceEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        })
        const data = await res.json()

        if (data.status === 'invalid' || data.status === 'abuse' || data.status === 'spamtrap') {
          setError('Please enter a valid email address')
          setIsVerifying(false)
          return
        }
      } catch (e) {
        console.error('ZeroBounce error:', e)
        // Continue anyway on error
      }
    }

    setIsVerifying(false)
    onSubmit(email, firstName)
  }

  return (
    <div className="flex-1 flex flex-col justify-start px-4 pt-12 animate-fadeIn">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-3">
          Your recommendation is ready.
        </h2>
        <p className="text-gray-500">
          Enter your email to see your personalized results + exclusive discount.
        </p>
      </div>

      <div className="space-y-3 max-w-sm mx-auto w-full">
        <input
          type="text"
          placeholder="First name (optional)"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-base outline-none focus:border-gray-300 transition-colors"
        />

        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            setError('')
          }}
          className="w-full px-4 py-3 border-2 rounded-xl text-base outline-none transition-colors"
          style={{
            borderColor: error ? '#dc3545' : '#e5e5e5',
          }}
        />

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={isVerifying}
          className="w-full py-4 rounded-xl text-white font-semibold text-lg transition-all duration-200"
          style={{
            backgroundColor: isVerifying ? '#ccc' : brandColor,
            cursor: isVerifying ? 'not-allowed' : 'pointer',
          }}
        >
          {isVerifying ? 'Verifying...' : 'See My Results'}
        </button>

        <button
          onClick={onSkip}
          className="w-full text-gray-400 text-sm underline py-2"
        >
          Skip and see results
        </button>

        <p className="text-center text-xs text-gray-400 mt-4">
          🔒 We respect your privacy
        </p>
      </div>
    </div>
  )
}
