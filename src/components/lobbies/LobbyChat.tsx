import { useState, useEffect, useRef, useCallback } from 'react'
import { getMessages, sendMessage, subscribeToMessages } from '../../lib/messages'
import { supabase } from '../../lib/supabase'

function formatTime(ts: string): string {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

interface LobbyChatProps {
  lobbyId: string
  userId: string | undefined
  userProfile: any
}

export default function LobbyChat({ lobbyId, userId, userProfile }: LobbyChatProps) {
  const [messages, setMessages] = useState<any[]>([])
  const [text, setText]         = useState('')
  const [sending, setSending]   = useState(false)
  const bottomRef               = useRef<HTMLDivElement | null>(null)
  const inputRef                = useRef<HTMLInputElement | null>(null)

  const reload = useCallback(() => {
    getMessages(lobbyId).then(({ data }) => setMessages(data))
  }, [lobbyId])

  useEffect(() => {
    reload()
    const channel = subscribeToMessages(lobbyId, () => reload())
    return () => { supabase.removeChannel(channel) }
  }, [lobbyId, reload])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim() || sending) return
    const content = text.trim()
    setText('')

    const optimistic = {
      id:         `opt-${Date.now()}`,
      user_id:    userId,
      content,
      created_at: new Date().toISOString(),
      users:      userProfile ?? null,
    }
    setMessages((prev) => [...prev, optimistic])

    setSending(true)
    await sendMessage(lobbyId, userId!, content)
    setSending(false)
    inputRef.current?.focus()
  }

  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] overflow-hidden flex flex-col" style={{ height: '380px' }}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/8 flex items-center gap-2">
        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        <p className="text-white font-bold text-sm">Lobby Chat</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-hide">
        {messages.length === 0 && (
          <p className="text-gray-600 text-sm text-center py-6">No messages yet. Say something!</p>
        )}
        {messages.map((msg) => {
          const isMe = msg.user_id === userId
          const color = msg.users?.colleges?.primary_color ?? '#0891b2'
          return (
            <div key={msg.id} className={`flex gap-2.5 ${isMe ? 'flex-row-reverse' : ''}`}>
              {/* Avatar */}
              <div
                className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-white font-black text-[10px] select-none"
                style={{ background: `linear-gradient(135deg, ${color}cc, ${color}55)` }}
              >
                {(msg.users?.display_name ?? '?')[0].toUpperCase()}
              </div>
              {/* Bubble */}
              <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                {!isMe && (
                  <p className="text-gray-500 text-[10px] px-1">{msg.users?.display_name}</p>
                )}
                <div
                  className={`px-3 py-2 rounded-2xl text-sm leading-relaxed
                    ${isMe
                      ? 'bg-gradient-to-br from-violet-600 to-purple-600 text-white rounded-tr-sm'
                      : 'bg-white/8 text-gray-100 rounded-tl-sm'}`}
                >
                  {msg.content}
                </div>
                <p className="text-gray-700 text-[10px] px-1">{formatTime(msg.created_at)}</p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="px-3 py-3 border-t border-white/8 flex gap-2">
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          maxLength={500}
          className="flex-1 px-3 py-2 rounded-xl bg-[#111118] border border-white/10 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-violet-400/50 transition-all"
        />
        <button
          type="submit"
          disabled={!text.trim() || sending}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold text-sm disabled:opacity-40 transition-all"
        >
          Send
        </button>
      </form>
    </div>
  )
}
