'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LogoutButton() {
  const supabase = createClient()
  const router = useRouter()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      style={{
        border: '1px solid #5E89C1',
        borderRadius: 12,
        padding: '10px 14px',
        background: '#EEF4FB',
        color: '#0F6E75',
        cursor: 'pointer',
        fontWeight: 600,
      }}
    >
      выйти
    </button>
  )
}