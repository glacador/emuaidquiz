'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { FunnelConfig, SlideType, QuestionSlideType, BeliefCardSlideType, SocialProofSlideType } from '@/config/schema'
import { scoreQuiz } from '@/lib/scoring'
import {
  pushToKlaviyo,
  fireGA4Event,
  fireMetaEvent,
  initGA4,
  initMetaPixel,
  initKlaviyo,
  codeTreatments,
  codeFear,
  pushDataLayerEvent,
} from '@/lib/analytics'
import QuestionSlide from './QuestionSlide'
import BeliefCard from './BeliefCard'
import SocialProof from './SocialProof'
import EmailCapture from './EmailCapture'
import ProgressReveal from './ProgressReveal'
import LoadingScreen from './LoadingScreen'
import ProgressBar from './ProgressBar'

interface QuizEngineProps {
  config: FunnelConfig
}

type Phase = 'quiz' | 'email' | 'reveal' | 'loading'

export default function QuizEngine({ config }: QuizEngineProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [multiAnswers, setMultiAnswers] = useState<Record<string, string[]>>({})
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [phase, setPhase] = useState<Phase>('quiz')
  const [startTime] = useState(Date.now())
  const [isFullscreen, setIsFullscreen] = useState(false)

  const slides = config.questions
  const currentSlide = slides[currentIndex]

  // Calculate progress
  const questionSlides = useMemo(() =>
    slides.filter((s): s is QuestionSlideType =>
      s.type !== 'belief-card' && s.type !== 'social-proof'
    ), [slides])

  const totalQuestions = questionSlides.length
  const answeredQuestions = Object.keys(answers).length + Object.keys(multiAnswers).length

  // Progress with power curve (rawPct^0.75)
  const rawProgress = answeredQuestions / totalQuestions
  const displayProgress = Math.pow(rawProgress, 0.75) * 100

  // Initialize analytics
  useEffect(() => {
    if (typeof window === 'undefined') return
    initGA4(config.tracking.ga4MeasurementId)
    initMetaPixel(config.tracking.metaPixelId)
    initKlaviyo(config.tracking.klaviyoPublicKey)
  }, [config.tracking])

  // Haptic feedback
  const triggerHaptic = useCallback(() => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(10)
    }
  }, [])

  // Handle answer selection
  const handleAnswer = useCallback((questionId: string, value: string, isMulti = false) => {
    triggerHaptic()

    // Track first answer as quiz start
    if (answeredQuestions === 0) {
      setIsFullscreen(true)
      pushDataLayerEvent('quiz_started', {
        quiz_id: config.funnel.id,
        quiz_version: 'v1',
      })
    }

    if (isMulti) {
      setMultiAnswers(prev => {
        const current = prev[questionId] || []
        const updated = current.includes(value)
          ? current.filter(v => v !== value)
          : [...current, value]
        return { ...prev, [questionId]: updated }
      })
    } else {
      setAnswers(prev => ({ ...prev, [questionId]: value }))

      // Auto-advance after 350ms (per spec)
      setTimeout(() => {
        if (currentIndex < slides.length - 1) {
          setCurrentIndex(prev => prev + 1)
        } else {
          setPhase('email')
        }
      }, 350)
    }
  }, [currentIndex, slides.length, triggerHaptic, answeredQuestions, config.funnel.id])

  // Handle multi-select continue
  const handleMultiContinue = useCallback(() => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(prev => prev + 1)
    } else {
      setPhase('email')
    }
  }, [currentIndex, slides.length])

  // Handle email submission
  const handleEmailSubmit = useCallback((submittedEmail: string, submittedName?: string) => {
    setEmail(submittedEmail)
    if (submittedName) setFirstName(submittedName)
    setPhase('reveal')
  }, [])

  // Handle skip email
  const handleSkipEmail = useCallback(() => {
    pushDataLayerEvent('quiz_email_skipped', {})
    setPhase('reveal')
  }, [])

  // Handle reveal complete
  const handleRevealComplete = useCallback(() => {
    setPhase('loading')
  }, [])

  // Handle loading complete - redirect to results
  const handleLoadingComplete = useCallback(() => {
    const result = scoreQuiz(answers, multiAnswers, config)
    const timeToComplete = Date.now() - startTime

    // Get fear answer and treatments
    const fearAnswer = answers['10'] || 'd'
    const triedAnswers = multiAnswers['9'] || []
    const codedTried = codeTreatments(triedAnswers)
    const codedFearValue = codeFear(fearAnswer)

    // Push to Klaviyo if email provided
    if (email) {
      pushToKlaviyo({
        email,
        firstName,
        groupCode: result.groupCode,
        urgency: result.urgency,
        band: result.band,
        intent: result.urgency >= 75 ? 'ready' : result.urgency >= 55 ? 'considering' : 'exploring',
        t: codedTried,
        f: codedFearValue,
        config,
      })
    }

    // Fire GA4 event
    fireGA4Event('quiz_completed', {
      quiz_id: config.funnel.id,
      group_code: result.groupCode,
      urgency: result.urgency,
      time_to_complete: timeToComplete,
    })

    // Fire Meta event
    fireMetaEvent('CompleteRegistration', {
      content_name: config.funnel.id,
      status: result.groupCode,
    })

    // Build redirect URL with parameters
    const params = new URLSearchParams(window.location.search)
    params.set('g', result.groupCode)
    params.set('u', result.band)
    params.set('s', String(result.urgency))
    params.set('f', fearAnswer.toLowerCase())

    // Redirect to results page (include funnel ID in path)
    window.location.href = `/${config.funnel.id}/${result.conditionSlug}?${params.toString()}`
  }, [answers, multiAnswers, config, email, firstName, startTime])

  // Auto-advance for belief cards and social proof
  useEffect(() => {
    if (!currentSlide) return

    if (currentSlide.type === 'belief-card' || currentSlide.type === 'social-proof') {
      const duration = (currentSlide as BeliefCardSlideType | SocialProofSlideType).duration || 3500
      const timer = setTimeout(() => {
        setCurrentIndex(prev => prev + 1)
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [currentIndex, currentSlide])

  // Calculate urgency for reveal (preview)
  const previewResult = useMemo(() =>
    scoreQuiz(answers, multiAnswers, config),
    [answers, multiAnswers, config]
  )

  return (
    <div
      className={`quiz-container ${isFullscreen ? 'fixed inset-0 z-50 overflow-y-auto' : ''}`}
      style={{
        maxWidth: isFullscreen ? undefined : 480,
        margin: '0 auto',
        minHeight: '100vh',
        background: config.funnel.brandColorBg,
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div
        className="max-w-[480px] mx-auto bg-white min-h-screen flex flex-col"
      >
        {/* Header */}
        <div
          className="sticky top-0 z-50 bg-white px-4 py-3 border-b border-gray-100"
        >
          <div className="flex items-center justify-between mb-2">
            <div
              className="font-bold text-lg"
              style={{ color: config.funnel.brandColor }}
            >
              {config.funnel.name}
              <span className="text-xs align-super">™</span>
            </div>
            {isFullscreen && (
              <button
                onClick={() => setIsFullscreen(false)}
                className="text-gray-400 text-xl p-1"
              >
                ×
              </button>
            )}
          </div>
          <ProgressBar
            progress={displayProgress}
            color={config.funnel.brandColor}
            total={totalQuestions}
            current={answeredQuestions}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4">
          {phase === 'quiz' && currentSlide && (
            <>
              {currentSlide.type === 'belief-card' && (
                <BeliefCard
                  icon={(currentSlide as BeliefCardSlideType).icon}
                  stat={(currentSlide as BeliefCardSlideType).stat}
                  headline={(currentSlide as BeliefCardSlideType).headline}
                  subtext={(currentSlide as BeliefCardSlideType).subtext}
                  brandColor={config.funnel.brandColor}
                />
              )}

              {currentSlide.type === 'social-proof' && (
                <SocialProof
                  name={(currentSlide as SocialProofSlideType).name}
                  location={(currentSlide as SocialProofSlideType).location}
                  pattern={(currentSlide as SocialProofSlideType).pattern}
                  quote={(currentSlide as SocialProofSlideType).quote}
                  timeAgo={(currentSlide as SocialProofSlideType).timeAgo}
                />
              )}

              {(currentSlide.type === 'single' ||
                currentSlide.type === 'multi' ||
                currentSlide.type === 'image-grid') && (
                <QuestionSlide
                  question={currentSlide as QuestionSlideType}
                  answer={answers[(currentSlide as QuestionSlideType).id]}
                  multiAnswer={multiAnswers[(currentSlide as QuestionSlideType).id]}
                  onAnswer={handleAnswer}
                  onMultiContinue={handleMultiContinue}
                  brandColor={config.funnel.brandColor}
                />
              )}
            </>
          )}

          {phase === 'email' && (
            <EmailCapture
              onSubmit={handleEmailSubmit}
              onSkip={handleSkipEmail}
              brandColor={config.funnel.brandColor}
              zerobounceEndpoint={config.tracking.zerobounceEndpoint}
            />
          )}

          {phase === 'reveal' && (
            <ProgressReveal
              onComplete={handleRevealComplete}
              brandColor={config.funnel.brandColor}
              urgency={previewResult.urgency}
            />
          )}

          {phase === 'loading' && (
            <LoadingScreen
              onComplete={handleLoadingComplete}
              brandColor={config.funnel.brandColor}
            />
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
