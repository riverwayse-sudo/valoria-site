'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

// ─── brand tokens ─────────────────────────────────────────────────────────────
const GOLD    = '#C9A84C'
const DARK    = '#0F0F1A'
const MID     = '#1A1A2E'
const PARCH   = '#F7F4EE'
const DIM     = 'rgba(247,244,238,.5)'
const FAINT   = 'rgba(247,244,238,.15)'
const GLINE   = 'rgba(201,168,76,.12)'
const GLINE2  = 'rgba(201,168,76,.28)'

function getAvatarLetters(name) {
  if (!name) return '?'
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[words.length - 1][0]).toUpperCase()
}

function formatTime(dateStr) {
  const date = new Date(dateStr)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  
  if (isToday) {
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  }
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

// ─── Thread List View ─────────────────────────────────────────────────────────
function ThreadList({ threads, onSelect, activeThreadId }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{
        padding: '14px 16px',
        borderBottom: `1px solid ${GLINE}`,
        flexShrink: 0,
      }}>
        <span style={{ fontSize: '11px', fontWeight: 600, color: PARCH, letterSpacing: '.1em' }}>
          MESSAGES
        </span>
      </div>
      
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {threads.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', marginBottom: '10px', opacity: 0.4 }}>✉️</div>
            <p style={{ fontSize: '12px', color: DIM, margin: 0 }}>No messages yet</p>
          </div>
        ) : (
          threads.map((thread) => {
            const otherParty = thread.other_party
            const isActive = thread.id === activeThreadId
            const hasUnread = thread.unread_count > 0
            
            return (
              <div
                key={thread.id}
                onClick={() => onSelect(thread)}
                style={{
                  padding: '14px 16px',
                  borderBottom: `1px solid ${GLINE}`,
                  cursor: 'pointer',
                  background: isActive ? 'rgba(201,168,76,.08)' : (hasUnread ? 'rgba(201,168,76,.04)' : 'transparent'),
                  transition: 'background .15s',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(201,168,76,.06)' }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = hasUnread ? 'rgba(201,168,76,.04)' : 'transparent' }}
              >
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    border: `1px solid ${hasUnread ? GOLD : GLINE2}`,
                    background: MID,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                    color: hasUnread ? GOLD : DIM,
                    flexShrink: 0,
                    overflow: 'hidden',
                  }}>
                    {otherParty?.photo_url ? (
                      <img src={otherParty.photo_url} alt={otherParty.display_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      getAvatarLetters(otherParty?.display_name)
                    )}
                  </div>
                  
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                      <span style={{
                        fontSize: '13px',
                        fontWeight: hasUnread ? 600 : 500,
                        color: PARCH,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {otherParty?.display_name || 'Unknown'}
                      </span>
                      <span style={{ fontSize: '10px', color: DIM, flexShrink: 0, marginLeft: '8px' }}>
                        {formatTime(thread.updated_at)}
                      </span>
                    </div>
                    <p style={{
                      fontSize: '11px',
                      fontWeight: hasUnread ? 500 : 300,
                      color: hasUnread ? PARCH : DIM,
                      margin: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {thread.last_message || 'No messages yet'}
                    </p>
                  </div>
                  
                  {hasUnread && (
                    <span style={{
                      minWidth: '18px',
                      height: '18px',
                      background: GOLD,
                      color: DARK,
                      fontSize: '9px',
                      fontWeight: 700,
                      borderRadius: '999px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0 5px',
                      flexShrink: 0,
                    }}>
                      {thread.unread_count > 9 ? '9+' : thread.unread_count}
                    </span>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

// ─── Message View ─────────────────────────────────────────────────────────────
function MessageView({ thread, currentUserId, onBack, onNewMessage }) {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(true)
  const messagesEndRef = useRef(null)
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchMessages = useCallback(async () => {
    if (!thread?.id) return
    setLoadingMessages(true)
    try {
      const { data, error } = await supabase
        .from('message_thread_messages')
        .select('*')
        .eq('thread_id', thread.id)
        .order('created_at', { ascending: true })

      if (error) throw error
      setMessages(data || [])
      
      // Mark thread as read
      if (thread.unread_count > 0) {
        await supabase
          .from('message_threads')
          .update({ unread_count: 0 })
          .eq('id', thread.id)
      }
    } catch (err) {
      console.error('Error fetching messages:', err.message)
    } finally {
      setLoadingMessages(false)
    }
  }, [thread?.id, thread?.unread_count])

  useEffect(() => {
    fetchMessages()
    
    // Subscribe to new messages in this thread
    const channel = supabase
      .channel(`thread-${thread?.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'message_thread_messages',
          filter: `thread_id=eq.${thread?.id}`,
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [thread?.id, fetchMessages])

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || sending) return
    
    setSending(true)
    try {
      const { error } = await supabase
        .from('message_thread_messages')
        .insert({
          thread_id: thread.id,
          sender_id: currentUserId,
          content: newMessage.trim(),
        })

      if (error) throw error
      
      setNewMessage('')
      onNewMessage?.()
    } catch (err) {
      console.error('Error sending message:', err.message)
    } finally {
      setSending(false)
    }
  }

  const otherParty = thread?.other_party

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: `1px solid ${GLINE}`,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        flexShrink: 0,
      }}>
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px 8px 4px 0',
            color: DIM,
            fontSize: '18px',
          }}
          aria-label="Back to message list"
        >
          ←
        </button>
        
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: MID,
          border: `1px solid ${GLINE2}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '11px',
          color: DIM,
          overflow: 'hidden',
          flexShrink: 0,
        }}>
          {otherParty?.photo_url ? (
            <img src={otherParty.photo_url} alt={otherParty.display_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            getAvatarLetters(otherParty?.display_name)
          )}
        </div>
        
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '13px', fontWeight: 500, color: PARCH }}>
            {otherParty?.display_name || 'Unknown'}
          </div>
          {otherParty?.headline && (
            <div style={{ fontSize: '10px', color: DIM, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {otherParty.headline}
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {loadingMessages ? (
          <div style={{ textAlign: 'center', color: DIM, fontSize: '12px', padding: '40px' }}>
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: DIM, fontSize: '12px', padding: '40px' }}>
            Start the conversation
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.sender_id === currentUserId
            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  justifyContent: isOwn ? 'flex-end' : 'flex-start',
                  marginBottom: '12px',
                }}
              >
                <div style={{
                  maxWidth: '75%',
                  padding: '10px 14px',
                  borderRadius: '14px',
                  background: isOwn ? GOLD : MID,
                  color: isOwn ? DARK : PARCH,
                  fontSize: '13px',
                  lineHeight: 1.5,
                  borderBottomRightRadius: isOwn ? '4px' : '14px',
                  borderBottomLeftRadius: isOwn ? '14px' : '4px',
                }}>
                  <p style={{ margin: 0 }}>{msg.content}</p>
                  <div style={{
                    fontSize: '9px',
                    marginTop: '4px',
                    opacity: 0.6,
                    textAlign: 'right',
                  }}>
                    {formatTime(msg.created_at)}
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} style={{
        padding: '12px 16px',
        borderTop: `1px solid ${GLINE}`,
        display: 'flex',
        gap: '10px',
        flexShrink: 0,
      }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          disabled={sending}
          style={{
            flex: 1,
            background: MID,
            border: `1px solid ${GLINE}`,
            borderRadius: '999px',
            padding: '10px 16px',
            fontSize: '13px',
            color: PARCH,
            outline: 'none',
            fontFamily: 'inherit',
          }}
          onFocus={e => e.target.style.borderColor = GOLD}
          onBlur={e => e.target.style.borderColor = GLINE}
        />
        <button
          type="submit"
          disabled={!newMessage.trim() || sending}
          style={{
            background: GOLD,
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: !newMessage.trim() || sending ? 0.5 : 1,
            transition: 'opacity .15s',
          }}
          aria-label="Send message"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={DARK} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </form>
    </div>
  )
}

// ─── ThreadPanel (Main Component) ─────────────────────────────────────────────
export default function ThreadPanel({ userId, isOpen, onClose }) {
  const [threads, setThreads] = useState([])
  const [activeThread, setActiveThread] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchThreads = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    try {
      // Fetch threads where user is participant
      const { data, error } = await supabase
        .from('message_threads')
        .select(`
          *,
          participant1:participant_1_id(display_name, headline, photo_url),
          participant2:participant_2_id(display_name, headline, photo_url)
        `)
        .or(`participant_1_id.eq.${userId},participant_2_id.eq.${userId}`)
        .order('updated_at', { ascending: false })

      if (error) throw error

      // Transform to get "other party" for each thread
      const transformed = (data || []).map(thread => ({
        ...thread,
        other_party: thread.participant_1_id === userId
          ? thread.participant2
          : thread.participant1,
      }))

      setThreads(transformed)
    } catch (err) {
      console.error('Error fetching threads:', err.message)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (isOpen) {
      fetchThreads()
      setActiveThread(null)
    }
  }, [isOpen, fetchThreads])

  // Subscribe to thread updates
  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel('threads-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'message_threads',
        },
        () => {
          fetchThreads()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, fetchThreads])

  const handleThreadSelect = (thread) => {
    setActiveThread(thread)
  }

  const handleBack = () => {
    setActiveThread(null)
    fetchThreads() // Refresh to update unread counts
  }

  const handleNewMessage = () => {
    fetchThreads() // Refresh thread list
  }

  if (!isOpen) return null

  return (
    <>
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(15,15,26,.7)', zIndex: 299 }}
        aria-hidden="true"
      />
      <div style={{
        position: 'fixed',
        top: '67px',
        right: '16px',
        width: '360px',
        height: 'calc(100vh - 83px)',
        background: DARK,
        border: `1px solid ${GLINE}`,
        borderRadius: '12px',
        boxShadow: '0 16px 48px rgba(0,0,0,.5)',
        zIndex: 300,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <button
          onClick={onClose}
          aria-label="Close messages"
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: DIM,
            fontSize: '18px',
            zIndex: 1,
            padding: '4px',
          }}
        >
          ×
        </button>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: DIM, fontSize: '12px' }}>
            Loading...
          </div>
        ) : activeThread ? (
          <MessageView
            thread={activeThread}
            currentUserId={userId}
            onBack={handleBack}
            onNewMessage={handleNewMessage}
          />
        ) : (
          <ThreadList
            threads={threads}
            onSelect={handleThreadSelect}
            activeThreadId={activeThread?.id}
          />
        )}
      </div>
    </>
  )
}

// ─── Message Button for Nav/Dashboard ────────────────────────────────────────
// A simple button to open the ThreadPanel
export function MessagesButton({ onClick, unreadCount }) {
  return (
    <button
      onClick={onClick}
      aria-label="Messages"
      style={{
        position: 'relative',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: DIM }}>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
      {unreadCount > 0 && (
        <span style={{
          position: 'absolute',
          top: 2,
          right: 2,
          minWidth: '16px',
          height: '16px',
          background: GOLD,
          color: DARK,
          fontSize: '9px',
          fontWeight: 700,
          borderRadius: '999px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 4px',
        }}>
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  )
}
