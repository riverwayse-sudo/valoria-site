import { supabase } from '@/lib/supabase'

export async function recordJourneyEvent({ userId, eventKey, source, sourceId = null, metadata = {} }) {
  if (!userId || !eventKey || !source) return { data: null, error: null }
  return supabase.from('valoria_journey_events').insert({
    user_id: userId, event_key: eventKey, source, source_id: sourceId, metadata,
  }).select().maybeSingle()
}

export async function createReentryLink({ userId = null, entryPoint, targetStage = null, source = null, sourceId = null, expiresAt = null }) {
  const token = crypto.randomUUID().replaceAll('-', '')
  return supabase.from('valoria_reentry_links').insert({
    user_id: userId, token, entry_point: entryPoint, target_stage: targetStage, source, source_id: sourceId, expires_at: expiresAt,
  }).select('token,entry_point,target_stage').single()
}

export async function getReentryLink(token) {
  return supabase.from('valoria_reentry_links').select('*').eq('token', token).maybeSingle()
}
