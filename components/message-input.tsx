'use client'

import { useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Props = {
  userId: string
}

export default function MessageInput({ userId }: Props) {
  const supabase = createClient()

  const [text, setText] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [errorText, setErrorText] = useState('')

  const fileLabel = useMemo(() => {
    if (!file)
      return 'фото не выбрано'
    return `выбрано: ${file.name}`
  }, [file])

  async function uploadImage() {
    if (!file)
      return null

    const ext = file.name.split('.').pop()
    const filePath = `${userId}/${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('chat-images')
      .upload(filePath, file)

    if (uploadError)
      throw new Error(uploadError.message)

    return filePath
  }

  async function sendMessage() {
    setErrorText('')

    const cleanText = text.trim()

    if (!cleanText && !file) {
      setErrorText('ну и смысл слать пустое сообщение?')
      return
    }

    setLoading(true)

    try {
      const imagePath = await uploadImage()

      const { error } = await supabase
        .from('messages')
        .insert({
          user_id: userId,
          text: cleanText || null,
          image_url: imagePath,
        })

      if (error)
        throw new Error(error.message)

      setText('')
      setFile(null)
    } catch (err) {
      if (err instanceof Error)
        setErrorText(err.message)
      else
        setErrorText('ого, что-то явно пошло не так')
    }

    setLoading(false)
  }

  async function handleSend(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    await sendMessage()
  }

  async function handleKeyDown(
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()

      if (loading)
        return

      await sendMessage()
    }
  }

  return (
    <form
      onSubmit={handleSend}
      style={{
        display: 'grid',
        gap: 12,
        border: '1px solid #CEC769',
        borderRadius: 20,
        padding: 18,
        background: '#FFFDF7',
        boxShadow: '0 10px 24px rgba(15, 110, 117, 0.08)',
      }}
    >
      <textarea
        placeholder="писать сюда"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={4}
        disabled={loading}
        style={{
          width: '100%',
          resize: 'vertical',
          border: '1px solid #5E89C1',
          borderRadius: 14,
          padding: 14,
          fontSize: 18,
          lineHeight: 1.4,
          outline: 'none',
          background: '#ffffff',
          color: '#1f2937',
        }}
      />

      <div
        style={{
          fontSize: 13,
          color: '#734765',
          marginTop: -4,
        }}
      >
        Enter — отправить, Shift+Enter — новая строка
      </div>

      <div
        style={{
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
        }}
      >
        <label
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 14px',
            borderRadius: 12,
            border: '1px solid #5E89C1',
            cursor: loading ? 'not-allowed' : 'pointer',
            background: '#EEF4FB',
            color: '#0F6E75',
            fontWeight: 600,
          }}
        >
          <input
            type="file"
            accept="image/*"
            disabled={loading}
            style={{ display: 'none' }}
            onChange={(e) => {
              const selected = e.target.files?.[0] ?? null
              setFile(selected)
            }}
          />
          <span>📷 фотку можно сюда</span>
        </label>

        <div
          style={{
            color: '#734765',
            fontSize: 14,
            flex: 1,
            minWidth: 180,
          }}
        >
          {fileLabel}
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            border: 'none',
            borderRadius: 14,
            padding: '12px 18px',
            fontSize: 16,
            fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            background: '#A12E2F',
            color: '#ffffff',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'отправка...' : 'отправить'}
        </button>
      </div>

      {errorText && (
        <p style={{ color: '#A12E2F', margin: 0 }}>
          {errorText}
        </p>
      )}
    </form>
  )
}