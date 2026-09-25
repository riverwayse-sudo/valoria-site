import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase service role configuration is missing.')
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
}

export async function GET(request) {
  const auth = request.headers.get('authorization') || ''
  const token = auth.replace(/^Bearer\s+/i, '')
  if (!token) return NextResponse.json({ error:'Unauthorized' }, { status:401 })
  const { data: userData, error:userError } = await getAdmin().auth.getUser(token)
  if (userError || !userData?.user) return NextResponse.json({ error:'Unauthorized' }, { status:401 })
  const { data:taster } = await getAdmin().from('taster_sessions').select('id,name,role,experience').eq('user_id', userData.user.id).order('linked_at',{ascending:false}).limit(1).maybeSingle()
  if (!taster) return NextResponse.json({ url:'https://assessment.valoriainstitute.com/' })
  return NextResponse.json({ url:`https://assessment.valoriainstitute.com/?full=1&taster_id=${encodeURIComponent(taster.id)}&name=${encodeURIComponent(taster.name||'')}&role=${encodeURIComponent(taster.role||'')}&experience=${encodeURIComponent(taster.experience||'')}` })
}
