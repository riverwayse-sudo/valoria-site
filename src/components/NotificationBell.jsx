'use client'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

// ─── brand tokens ─────────────────────────────────────────────────────────────
const GOLD    = '#C9A84C'
const DARK    = '#0F0F1A'
const MID     = '#1A1A2E'
const PARCH   = '#F7F4EE'
const DIM     = 'rgba(247,244,238,.5)'
const GLINE   = 'rgba(201,168,76,.12)'

export default function NotificationBell({ userId }) {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchNotifications = useCallback(async () => {
    if (!userId) return
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error && error.code !== 'PGRST116') throw error // Ignore "no rows" for RLS-blocked
      setNotifications(data || [])
      setUnreadCount((data || []).filter(n => !n.read_at).length)
    } catch (err) {
      console.error('Error fetching notifications:', err.message)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchNotifications()
    
    // Subscribe to real-time notification inserts
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setNotifications(prev => [payload.new, ...prev])
          setUnreadCount(prev => prev + 1)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, fetchNotifications])

  const markAsRead = async (notificationId) => {
    try {
      await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId)
      
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Error marking notification as read:', err.message)
    }
  }

  const markAllAsRead = async () => {
    if (!userId || unreadCount === 0) return
    try {
      await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('user_id', userId)
        .is('read_at', null)
      
      setNotifications(prev => prev.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() })))
      setUnreadCount(0)
    } catch (err) {
      console.error('Error marking all as read:', err.message)
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'enquiry': return '💬'
      case 'message': return '✉️'
      case 'valu_update': return '📊'
      case 'profile_view': return '👁️'
      case 'system': return '⚙️'
      default: return '🔔'
    }
  }

  const formatTime = (dateStr) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => { setIsOpen(!isOpen); if (!isOpen && unreadCount > 0) markAllAsRead() }}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        aria-expanded={isOpen}
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
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
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
            lineHeight: 1,
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            onClick={() => setIsOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 299 }}
            aria-hidden="true"
          />
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 12px)',
            right: 0,
            width: '340px',
            maxHeight: '480px',
            background: MID,
            border: `1px solid ${GLINE}`,
            borderRadius: '12px',
            boxShadow: '0 16px 48px rgba(0,0,0,.5)',
            zIndex: 300,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px',
              borderBottom: `1px solid ${GLINE}`,
            }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: PARCH, letterSpacing: '.1em' }}>
                NOTIFICATIONS
              </span>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '10px',
                    color: GOLD,
                    letterSpacing: '.06em',
                  }}
                >
                  Mark all read
                </button>
              )}
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
              {loading ? (
                <div style={{ padding: '32px', textAlign: 'center', color: DIM, fontSize: '12px' }}>
                  Loading...
                </div>
              ) : notifications.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                  <div style={{ fontSize: '28px', marginBottom: '10px', opacity: 0.4 }}>🔔</div>
                  <p style={{ fontSize: '12px', color: DIM, margin: 0 }}>No notifications yet</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => !notif.read_at && markAsRead(notif.id)}
                    style={{
                      padding: '14px 16px',
                      borderBottom: `1px solid ${GLINE}`,
                      cursor: notif.link ? 'pointer' : 'default',
                      background: notif.read_at ? 'transparent' : 'rgba(201,168,76,.04)',
                      transition: 'background .15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = notif.read_at ? 'rgba(201,168,76,.06)' : 'rgba(201,168,76,.08)'}
                    onMouseLeave={e => e.currentTarget.style.background = notif.read_at ? 'transparent' : 'rgba(201,168,76,.04)'}
                  >
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '16px', flexShrink: 0, marginTop: '2px' }}>
                        {getNotificationIcon(notif.type)}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                          fontSize: '12px',
                          fontWeight: notif.read_at ? 400 : 500,
                          color: PARCH,
                          margin: '0 0 4px',
                          lineHeight: 1.4,
                        }}>
                          {notif.title}
                        </p>
                        {notif.body && (
                          <p style={{
                            fontSize: '11px',
                            fontWeight: 300,
                            color: DIM,
                            margin: 0,
                            lineHeight: 1.4,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}>
                            {notif.body}
                          </p>
                        )}
                        <span style={{ fontSize: '10px', color: DIM, opacity: 0.7, marginTop: '4px', display: 'block' }}>
                          {formatTime(notif.created_at)}
                        </span>
                      </div>
                      {!notif.read_at && (
                        <div style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: GOLD,
                          flexShrink: 0,
                          marginTop: '6px',
                        }} />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
