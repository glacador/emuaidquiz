'use client'

import { useState } from 'react'

interface FAQSectionProps {
  brandColor: string
}

const FAQ_ITEMS = [
  {
    question: 'How quickly will I see results?',
    answer: 'Most users report noticeable improvement within 2-3 weeks of consistent use. However, results can vary depending on your specific skin pattern and how closely you follow your personalized protocol.',
  },
  {
    question: 'Is this safe for sensitive skin?',
    answer: 'Yes! EMUAID is formulated with natural ingredients and is safe for sensitive skin. 94% of users report zero irritation. However, we always recommend doing a patch test before full application.',
  },
  {
    question: 'What if it doesn\'t work for me?',
    answer: 'We offer a 30-day money-back guarantee. If you don\'t see improvement with your matched protocol, simply contact us for a full refund. No questions asked.',
  },
  {
    question: 'How is this different from what I\'ve tried?',
    answer: 'Unlike generic treatments, your protocol is specifically matched to your skin pattern based on your quiz answers. This targeted approach addresses the root cause rather than just symptoms.',
  },
]

export default function FAQSection({ brandColor }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="px-5 py-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Frequently Asked Questions
      </h3>

      <div className="space-y-2">
        {FAQ_ITEMS.map((item, index) => (
          <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full p-4 text-left flex items-center justify-between"
            >
              <span className="font-medium text-gray-800 text-sm">
                {item.question}
              </span>
              <span
                className="text-xl transition-transform duration-200"
                style={{
                  color: brandColor,
                  transform: openIndex === index ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              >
                ▾
              </span>
            </button>

            {openIndex === index && (
              <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed animate-fadeIn">
                {item.answer}
              </div>
            )}
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; max-height: 0; }
          to { opacity: 1; max-height: 200px; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  )
}
