import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import MessageInput from '@/components/message-input'
import LogoutButton from '@/components/logout-button'
import ChatRoom from '@/components/chat-room'

type RawMessageRow = {
  id: string
  text: string | null
  image_url: string | null
  created_at: string
  profiles: {
    display_name: string
  }[]
}

type MessageRow = {
  id: string
  text: string | null
  image_url: string | null
  created_at: string
  profiles: {
    display_name: string
  } | null
  signed_image_url: string | null
}

export default async function ChatPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user)
    redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', user.id)
    .single()

  if (!profile?.display_name)
    redirect('/setup-profile')

  const { data: messages } = await supabase
    .from('messages')
    .select(`
      id,
      text,
      image_url,
      created_at,
      profiles (
        display_name
      )
    `)
    .order('created_at', { ascending: true })

  const preparedMessages: MessageRow[] = await Promise.all(
    (messages ?? []).map(async (msg: RawMessageRow) => {
      const profile = msg.profiles?.[0] ?? null

      if (!msg.image_url) {
        return {
          ...msg,
          profiles: profile,
          signed_image_url: null,
        }
      }

      const { data } = await supabase.storage
        .from('chat-images')
        .createSignedUrl(msg.image_url, 3600)

      return {
        ...msg,
        profiles: profile,
        signed_image_url: data?.signedUrl ?? null,
      }
    })
  )

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#F7F4EC',
        padding: 20,
      }}
    >
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
            gap: 16,
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: 32, color: '#0F6E75' }}>чат</h1>
            <p style={{ margin: '6px 0 0 0', color: '#734765' }}>
              эдип советует присмотреться
            </p>
          </div>

          <LogoutButton />
        </div>

        <ChatRoom initialMessages={preparedMessages} />
        <MessageInput userId={user.id} />
      </div>
    </main>
  )
}