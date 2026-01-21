'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  folder?: string
  className?: string
}

export default function ImageUpload({
  value,
  onChange,
  folder = 'questions',
  className = '',
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB')
      return
    }

    setUploading(true)
    setError(null)

    try {
      // Generate unique filename
      const ext = file.name.split('.').pop()
      const filename = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('quiz-images')
        .upload(filename, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('quiz-images')
        .getPublicUrl(filename)

      onChange(publicUrl)
    } catch (err) {
      console.error('Upload error:', err)
      setError('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = async () => {
    if (!value) return

    try {
      // Extract path from URL
      const url = new URL(value)
      const path = url.pathname.split('/quiz-images/')[1]

      if (path) {
        await supabase.storage.from('quiz-images').remove([path])
      }

      onChange('')
    } catch (err) {
      console.error('Remove error:', err)
    }
  }

  return (
    <div className={className}>
      {value ? (
        <div className="relative inline-block">
          <Image
            src={value}
            alt="Uploaded image"
            width={200}
            height={150}
            className="rounded-lg object-cover"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-sm hover:bg-red-600"
          >
            ×
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
        >
          {uploading ? (
            <p className="text-gray-500">Uploading...</p>
          ) : (
            <>
              <p className="text-gray-500 mb-2">Click to upload image</p>
              <p className="text-xs text-gray-400">PNG, JPG up to 5MB</p>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
      />

      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}
    </div>
  )
}
