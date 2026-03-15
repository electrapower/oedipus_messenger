'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatEuropeanDate } from '@/lib/format-date'

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

type Props = {
  initialMessages: MessageRow[]
}

export default function ChatRoom({ initialMessages }: Props) {
  const supabase = createClient()
  const [messages, setMessages] = useState<MessageRow[]>(initialMessages)
  const bottomRef = useRef<HTMLDivElement | null>(null)

  function scrollToBottom() {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    async function loadMessages() {
      const { data } = await supabase
        .from('messages')
        .select(`
          id,
          text,
          image_url,
          created_at,
          profiles:profiles!messages_user_id_fkey (
            display_name
          )
        `)
        .order('created_at', { ascending: true })

      const preparedMessages: MessageRow[] = await Promise.all(
        (data ?? []).map(async (msg: RawMessageRow) => {
          const profile = msg.profiles?.[0] ?? null

          if (!msg.image_url) {
            return {
              ...msg,
              profiles: profile,
              signed_image_url: null,
            }
          }

          const { data: signed } = await supabase.storage
            .from('chat-images')
            .createSignedUrl(msg.image_url, 3600)

          return {
            ...msg,
            profiles: profile,
            signed_image_url: signed?.signedUrl ?? null,
          }
        })
      )

      setMessages(preparedMessages)
    }

    const channel = supabase
      .channel('messages-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
        },
        async () => {
          await loadMessages()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  return (
    <section
      style={{
        border: '1px solid #CEC769',
        borderRadius: 20,
        padding: 20,
        height: 520,
        overflowY: 'auto',
        marginBottom: 20,
        background: '#FFFDF7',
        boxShadow: '0 10px 24px rgba(15, 110, 117, 0.08)',
      }}
    >
      {messages.length === 0 && (
        <div
          style={{
            height: '100%',
            display: 'grid',
            placeItems: 'center',
            color: '#734765',
            textAlign: 'center',
            padding: 24,
          }}
        >
          <div>
            <div style={{ fontSize: 22, marginBottom: 8 }}>пока пусто</div>
            <div>отправь первое сообщение</div>
          </div>
        </div>
      )}

      {messages.map((msg) => (
        <article
          key={msg.id}
          style={{
            padding: 14,
            border: '1px solid #D8D092',
            borderRadius: 16,
            marginBottom: 12,
            background: '#ffffff',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 12,
              alignItems: 'baseline',
              marginBottom: 8,
              flexWrap: 'wrap',
            }}
          >
            <div
              style={{
                fontWeight: 700,
                fontSize: 18,
                color: '#0F6E75',
              }}
            >
              {msg.profiles?.display_name ?? 'без имени'}
            </div>

            <div style={{ fontSize: 12, color: '#734765' }}>
              {formatEuropeanDate(msg.created_at)}
            </div>
          </div>

          {msg.text && (
            <p
              style={{
                margin: '0 0 10px 0',
                fontSize: 18,
                lineHeight: 1.5,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                color: '#1f2937',
              }}
            >
              {msg.text}
            </p>
          )}

          {msg.signed_image_url && (
            <img
              src={msg.signed_image_url}
              alt="uploaded"
              style={{
                maxWidth: '100%',
                maxHeight: 360,
                borderRadius: 14,
                display: 'block',
                border: '1px solid #CEC769',
              }}
            />
          )}
        </article>
      ))}

      <div ref={bottomRef} />
    </section>
  )
}