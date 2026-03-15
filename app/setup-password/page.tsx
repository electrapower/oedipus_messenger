'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SetPasswordPage() {
  const supabase = createClient()
  const router = useRouter()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorText, setErrorText] = useState('')

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setErrorText('')

    if (password.length < 8) {
      setErrorText('пароль должен быть не короче 8 символов')
      return
    }

    if (password !== confirmPassword) {
      setErrorText('пароли не совпадают')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.updateUser({
      password,
    })

    setLoading(false)

    if (error) {
      setErrorText(error.message)
      return
    }

    router.push('/chat')
    router.refresh()
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: 20,
        background: '#F7F4EC',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 460,
          background: '#FFFDF7',
          border: '1px solid #CEC769',
          borderRadius: 24,
          padding: 24,
          boxShadow: '0 10px 24px rgba(15, 110, 117, 0.08)',
        }}
      >
        <h1 style={{ marginTop: 0, marginBottom: 8, fontSize: 32, color: '#0F6E75' }}>
          придумай пароль
        </h1>

        <p style={{ marginTop: 0, marginBottom: 20, color: '#734765' }}>
          задай пароль для входа в чат
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
          <input
            type="password"
            placeholder="новый пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: '100%',
              border: '1px solid #5E89C1',
              borderRadius: 14,
              padding: 14,
              fontSize: 18,
              outline: 'none',
              background: '#ffffff',
              color: '#1f2937',
            }}
          />

          <input
            type="password"
            placeholder="повтори пароль"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={{
              width: '100%',
              border: '1px solid #5E89C1',
              borderRadius: 14,
              padding: 14,
              fontSize: 18,
              outline: 'none',
              background: '#ffffff',
              color: '#1f2937',
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 4,
              border: 'none',
              borderRadius: 14,
              padding: '14px 18px',
              fontSize: 18,
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              background: '#A12E2F',
              color: '#ffffff',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'сохраняем...' : 'сохранить пароль'}
          </button>
        </form>

        {errorText && (
          <p style={{ color: '#A12E2F', marginTop: 14, marginBottom: 0 }}>
            {errorText}
          </p>
        )}
      </div>
    </main>
  )
}