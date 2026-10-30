import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const TYPES = {
  cv: new Set(['pdf', 'doc', 'docx']),
  portfolio: new Set(['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png']),
  certification: new Set(['pdf', 'jpg', 'jpeg', 'png']),
  speaking_sample: new Set(['pdf', 'mp3', 'mp4', 'mov']),
  facilitation_record: new Set(['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'mp4', 'mov']),
}
const MIME = {
  pdf:'application/pdf', doc:'application/msword',
  docx:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  jpg:'image/jpeg', jpeg:'image/jpeg', png:'image/png',
  mp3:'audio/mpeg', mp4:'video/mp4', mov:'video/quicktime',
}
const MAX_BYTES = 10 * 1024 * 1024

function adminClient() {
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL
  const key=process.env.SUPABASE_SERVICE_ROLE_KEY
  return url&&key?createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}}):null
}

export async function POST(request) {
  const db=adminClient()
  if(!db) return NextResponse.json({error:'Evidence service is temporarily unavailable.'},{status:503})
  const token=request.headers.get('authorization')?.match(/^Bearer\\s+(.+)$/i)?.[1]
  if(!token) return NextResponse.json({error:'Sign in before submitting evidence.'},{status:401})
  const {data:{user},error:authError}=await db.auth.getUser(token)
  if(authError||!user) return NextResponse.json({error:'Your session could not be verified.'},{status:401})
  if(!user.email_confirmed_at) return NextResponse.json({error:'Confirm your email before submitting evidence.'},{status:403})

  let form
  try { form=await request.formData() } catch { return NextResponse.json({error:'Invalid evidence submission.'},{status:400}) }
  const file=form.get('file')
  const documentType=String(form.get('document_type')||'')
  const capabilityId=String(form.get('capability_id')||'').trim()
  if(!(file instanceof File)||!TYPES[documentType]) return NextResponse.json({error:'Choose a supported evidence type and file.'},{status:400})
  if(!Number.isFinite(file.size)||file.size<1||file.size>MAX_BYTES) return NextResponse.json({error:'Evidence must be between 1 byte and 10MB.'},{status:400})
  const extension=String(file.name||'').split('.').pop().toLowerCase()
  if(!TYPES[documentType].has(extension)||!MIME[extension]) return NextResponse.json({error:'This file format is not supported for the selected evidence type.'},{status:415})
  if(documentType==='cv'&&capabilityId) return NextResponse.json({error:'CV evidence is profile-wide and must not be assigned to one capability.'},{status:400})
  if(documentType!=='cv'&&!capabilityId) return NextResponse.json({error:'Select the capability this evidence supports.'},{status:400})

  if(capabilityId) {
    const {data:capability,error}=await db.from('professional_capabilities')
      .select('id,professional_id,is_active,capability')
      .eq('id',capabilityId).eq('professional_id',user.id).maybeSingle()
    if(error) return NextResponse.json({error:'Could not verify the selected capability.'},{status:500})
    if(!capability||!capability.is_active) return NextResponse.json({error:'That capability is not active on your profile.'},{status:403})
  } else {
    const {data:profile,error}=await db.from('professional_profiles').select('id').eq('id',user.id).maybeSingle()
    if(error||!profile) return NextResponse.json({error:'Your professional profile could not be verified.'},{status:404})
  }

  const bucket='cvs'
  const path='profiles/'+user.id+'/evidence/'+(capabilityId||'profile')+'/'+crypto.randomUUID()+'.'+extension
  const {error:uploadError}=await db.storage.from(bucket).upload(path,file,{contentType:MIME[extension],upsert:false})
  if(uploadError) return NextResponse.json({error:'Evidence upload failed. Please try again.'},{status:502})
  const {data:document,error:insertError}=await db.from('professional_documents').insert({
    professional_id:user.id, capability_id:capabilityId||null, document_type:documentType,
    storage_bucket:bucket,storage_path:path,original_filename:file.name,
    mime_type:MIME[extension],size_bytes:file.size,visibility:'private',verification_status:'pending'
  }).select('id,document_type,capability_id,verification_status,created_at').single()
  if(insertError) {
    await db.storage.from(bucket).remove([path]).catch(()=>{})
    return NextResponse.json({error:'The file was uploaded but could not be registered. The temporary file has been cleaned up; please retry.'},{status:502})
  }
  return NextResponse.json({ok:true,document}, {status:201})
}
