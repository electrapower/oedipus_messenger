'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorText, setErrorText] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErrorText('')
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
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
          maxWidth: 440,
          background: '#FFFDF7',
          border: '1px solid #CEC769',
          borderRadius: 24,
          padding: 24,
          boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
        }}
      >
        <h1 style={{ marginTop: 0, marginBottom: 8, fontSize: 32, color: '#0F6E75'}}>вход</h1>
        <p style={{ marginTop: 0, marginBottom: 20, color: '#734765' }}>
          велком
        </p>

        <form onSubmit={handleLogin} style={{ display: 'grid', gap: 12 }}>
          <input
            type="email"
            placeholder="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            placeholder="пароль"
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
            {loading ? 'входим...' : 'войти'}
          </button>
        </form>

        {errorText && (
          <p style={{ color: 'crimson', marginTop: 14, marginBottom: 0 }}>
            {errorText}
          </p>
        )}
      </div>
    </main>
  )
}