'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

interface QuestionOption {
  id: string
  label: string
  image_url: string | null
}

interface Question {
  id: string
  question_id: string
  type: string
  title: string | null
  headline: string | null
  sort_order: number
  options: QuestionOption[]
}

interface QuestionsListProps {
  questions: Question[]
  funnelId: string
}

export default function QuestionsList({ questions: initialQuestions, funnelId }: QuestionsListProps) {
  const [questions, setQuestions] = useState(initialQuestions)
  const [reordering, setReordering] = useState(false)
  const supabase = createClient()

  const moveQuestion = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= questions.length) return

    setReordering(true)

    const newQuestions = [...questions]
    const [moved] = newQuestions.splice(index, 1)
    newQuestions.splice(newIndex, 0, moved)

    // Update sort_order for affected questions
    const updates = newQuestions.map((q, i) => ({
      id: q.id,
      sort_order: i,
    }))

    setQuestions(newQuestions)

    // Update in database
    for (const update of updates) {
      await supabase
        .from('questions')
        .update({ sort_order: update.sort_order })
        .eq('id', update.id)
    }

    setReordering(false)
  }

  const deleteQuestion = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return

    await supabase.from('questions').delete().eq('id', id)
    setQuestions(questions.filter(q => q.id !== id))
  }

  const getQuestionDisplay = (q: Question) => {
    if (q.type === 'belief-card' || q.type === 'social-proof') {
      return q.headline || `[${q.type}]`
    }
    return q.title || `Question ${q.question_id}`
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'single': return 'bg-blue-100 text-blue-800'
      case 'multi': return 'bg-green-100 text-green-800'
      case 'image-grid': return 'bg-purple-100 text-purple-800'
      case 'belief-card': return 'bg-yellow-100 text-yellow-800'
      case 'social-proof': return 'bg-pink-100 text-pink-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="divide-y divide-gray-200">
        {questions.map((question, index) => (
          <div
            key={question.id}
            className="p-4 hover:bg-gray-50 flex items-center gap-4"
          >
            {/* Reorder buttons */}
            <div className="flex flex-col gap-1">
              <button
                onClick={() => moveQuestion(index, 'up')}
                disabled={index === 0 || reordering}
                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
              >
                ▲
              </button>
              <button
                onClick={() => moveQuestion(index, 'down')}
                disabled={index === questions.length - 1 || reordering}
                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
              >
                ▼
              </button>
            </div>

            {/* Question number */}
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
              {index + 1}
            </div>

            {/* Question content */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getTypeColor(question.type)}`}>
                  {question.type}
                </span>
                <span className="text-xs text-gray-400">ID: {question.question_id}</span>
              </div>
              <p className="font-medium text-gray-900">{getQuestionDisplay(question)}</p>

              {/* Show image thumbnails for image-grid questions */}
              {question.type === 'image-grid' && question.options.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {question.options.slice(0, 4).map((opt) => (
                    <div key={opt.id} className="relative">
                      {opt.image_url ? (
                        <Image
                          src={opt.image_url}
                          alt={opt.label}
                          width={40}
                          height={40}
                          className="rounded object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400">
                          ?
                        </div>
                      )}
                    </div>
                  ))}
                  {question.options.length > 4 && (
                    <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-500">
                      +{question.options.length - 4}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Options count */}
            <div className="text-sm text-gray-500">
              {question.options.length} options
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Link
                href={`/admin/questions/${question.id}?funnel=${funnelId}`}
                className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
              >
                Edit
              </Link>
              <button
                onClick={() => deleteQuestion(question.id)}
                className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
