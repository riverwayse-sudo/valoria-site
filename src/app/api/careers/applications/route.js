import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'node:crypto'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
const MAX_CV_BYTES=4*1024*1024
const BUCKET='career-applications'
const ALLOWED_TYPES=new Map([
 ['application/pdf','pdf'],
 ['application/msword','doc'],
 ['application/vnd.openxmlformats-officedocument.wordprocessingml.document','docx'],
])
function db(){const url=process.env.NEXT_PUBLIC_SUPABASE_URL;const key=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!url||!key)return null;return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}})}
function clean(value,max=3000){return String(value||'').trim().slice(0,max)}
function escapeHtml(value){return String(value||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function validEmail(value){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)&&value.length<=254}
export async function POST(request){
 let form
 try{form=await request.formData()}catch{return Response.json({error:'Invalid application form.'},{status:400})}
 // Silent success for the honeypot; never persist spam submissions.
 if(clean(form.get('website'),200))return Response.json({ok:true})
 const fullName=clean(form.get('fullName'),120),email=clean(form.get('email'),254).toLowerCase(),phone=clean(form.get('phone'),40),location=clean(form.get('location'),120),linkedin=clean(form.get('linkedin'),500),experience=clean(form.get('experience'),3000),achievement=clean(form.get('achievement'),3000),motivation=clean(form.get('motivation'),2000),consent=form.get('consent')==='true',cv=form.get('cv')
 if(!fullName||fullName.length<2||!validEmail(email)||!phone||!location||experience.length<30||achievement.length<30||motivation.length<20||!consent)return Response.json({error:'Please complete all required fields and confirm the recruitment privacy notice.'},{status:400})
 if(linkedin){try{const u=new URL(linkedin);if(!['http:','https:'].includes(u.protocol))throw new Error()}catch{return Response.json({error:'Enter a valid LinkedIn URL or leave it blank.'},{status:400})}}
 if(!(cv instanceof File)||cv.size<1||cv.size>MAX_CV_BYTES)return Response.json({error:'A CV file up to 5 MB is required.'},{status:400})
 const extension=ALLOWED_TYPES.get(cv.type)
 if(!extension||!cv.name.toLowerCase().endsWith('.'+extension))return Response.json({error:'CV must be a PDF, DOC or DOCX file.'},{status:400})
 const supabase=db()
 if(!supabase)return Response.json({error:'Application service is temporarily unavailable. Please try again later.'},{status:503})
 const {data:existing,error:lookupError}=await supabase.from('career_applications').select('id').eq('email',email).eq('role_slug','partnerships-executive').maybeSingle()
 if(lookupError)return Response.json({error:'We could not verify your application. Please try again later.'},{status:503})
 if(existing)return Response.json({error:'An application for this role has already been received from this email address. Please contact info@valoriainstitute.com if you need assistance.'},{status:409})
 const id=randomUUID(),storagePath='partnerships-executive/'+id+'.'+extension
 const bytes=Buffer.from(await cv.arrayBuffer())
 // Basic file-signature validation prevents an arbitrary renamed file from being stored as a CV.
 const isPdf=extension==='pdf'&&bytes.subarray(0,5).toString()==='%PDF-'
 const isDoc=extension==='doc'&&bytes.subarray(0,8).equals(Buffer.from([0xD0,0xCF,0x11,0xE0,0xA1,0xB1,0x1A,0xE1]))
 const isDocx=extension==='docx'&&bytes.subarray(0,4).equals(Buffer.from([0x50,0x4B,0x03,0x04]))
 if(!(isPdf||isDoc||isDocx))return Response.json({error:'The CV file does not appear to be a valid PDF, DOC or DOCX. Please export it again and retry.'},{status:400})
 const {error:uploadError}=await supabase.storage.from(BUCKET).upload(storagePath,bytes,{contentType:cv.type,upsert:false})
 if(uploadError){console.error('Career CV upload failed:',uploadError.message);return Response.json({error:'We could not securely store your CV. Please try again later.'},{status:503})}
 const row={id,role_slug:'partnerships-executive',role_title:'Partnerships Executive',full_name:fullName,email,phone,location,linkedin_url:linkedin||null,relevant_experience:experience,partnership_achievement:achievement,motivation,cv_storage_path:storagePath,cv_original_name:clean(cv.name,180),cv_content_type:cv.type,cv_size_bytes:cv.size,privacy_consent:true,status:'new',source:'website-careers'}
 const {error:insertError}=await supabase.from('career_applications').insert(row)
 if(insertError){
  await supabase.storage.from(BUCKET).remove([storagePath])
  if(insertError.code==='23505')return Response.json({error:'An application for this role has already been received from this email address.'},{status:409})
  console.error('Career application insert failed:',insertError.message)
  return Response.json({error:'We could not save your application. Please try again later.'},{status:503})
 }
 // Email is a notification channel, not the system of record: a mail failure must not lose the saved application.
 const brevoKey=process.env.BREVO_API_KEY
 if(brevoKey){
  const esc=escapeHtml
  const adminHtml='<div style="font-family:Arial,sans-serif;color:#1A1A2E;line-height:1.7"><p style="color:#9A7930;font-weight:bold;letter-spacing:2px">NEW CAREERS APPLICATION</p><h2>Partnerships Executive</h2><p><b>Candidate:</b> '+esc(fullName)+'</p><p><b>Email:</b> '+esc(email)+'</p><p><b>Phone:</b> '+esc(phone)+'</p><p><b>Location:</b> '+esc(location)+'</p><p><b>LinkedIn:</b> '+(linkedin?'<a href="'+esc(linkedin)+'">View profile</a>':'Not supplied')+'</p><h3>Relevant experience</h3><p>'+esc(experience).replace(/\n/g,'<br>')+'</p><h3>Partnership outcome</h3><p>'+esc(achievement).replace(/\n/g,'<br>')+'</p><h3>Motivation</h3><p>'+esc(motivation).replace(/\n/g,'<br>')+'</p><p><b>CV:</b> Stored securely in private application storage. Sign in to the Valoria admin dashboard to review candidate records.</p><p><b>Application reference:</b> '+id+'</p></div>'
  const send=(payload)=>fetch('https://api.brevo.com/v3/smtp/email',{method:'POST',headers:{'api-key':brevoKey,'Content-Type':'application/json'},body:JSON.stringify(payload)})
  try{
   const adminResponse=await send({sender:{name:'Valoria Institute Careers',email:'info@valoriainstitute.com'},to:[{email:'info@valoriainstitute.com'}],replyTo:{email,name:fullName},subject:'New Partnerships Executive application — '+fullName,htmlContent:adminHtml,tags:['careers','partnerships-executive']})
   if(!adminResponse.ok)console.error('Career admin notification failed:',adminResponse.status)
   const candidateHtml='<div style="font-family:Arial,sans-serif;color:#1A1A2E;line-height:1.7"><p>Dear '+esc(fullName.split(' ')[0])+',</p><p>Thank you for applying for the Partnerships Executive role at Valoria Institute. We have received your application and CV.</p><p>Our team will review your submission. If your experience aligns with the role, we will contact you regarding next steps.</p><p>Regards,<br><b>Valoria Institute</b><br>Worth. Built.</p></div>'
   const candidateResponse=await send({sender:{name:'Valoria Institute Careers',email:'info@valoriainstitute.com'},to:[{email,name:fullName}],replyTo:{email:'info@valoriainstitute.com',name:'Valoria Institute'},subject:'We received your Valoria Institute application',htmlContent:candidateHtml,tags:['careers-confirmation','partnerships-executive']})
   if(!candidateResponse.ok)console.error('Career candidate confirmation failed:',candidateResponse.status)
  }catch(error){console.error('Career notification delivery failed:',error?.message||'unknown error')}
 }else console.warn('BREVO_API_KEY is not configured; career applications are saved but email notifications are disabled.')
 return Response.json({ok:true,applicationId:id},{status:201})
}
