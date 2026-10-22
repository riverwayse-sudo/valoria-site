'use client'
import { useState } from 'react'
const initial = { fullName:'', email:'', phone:'', location:'', linkedin:'', experience:'', achievement:'', motivation:'', consent:false, website:'' }
export default function CareerApplicationForm() {
 const [form,setForm]=useState(initial),[cv,setCv]=useState(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[success,setSuccess]=useState(false)
 function change(e){const {name,value,type,checked}=e.target;setForm(p=>({...p,[name]:type==='checkbox'?checked:value}))}
 async function submit(e){
  e.preventDefault();setError('')
  if(!cv){setError('Please attach your CV to continue.');return}
  if(cv.size>4*1024*1024){setError('Your CV must be 4 MB or smaller.');return}
  const allowed=['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  if(!allowed.includes(cv.type)){setError('Upload your CV as a PDF, DOC or DOCX file.');return}
  setBusy(true)
  try{
   const body=new FormData()
   Object.entries(form).forEach(([k,v])=>body.append(k,String(v)))
   body.append('cv',cv)
   const response=await fetch('/api/careers/applications',{method:'POST',body})
   const result=await response.json().catch(()=>({}))
   if(!response.ok)throw new Error(result.error||'We could not submit your application. Please try again.')
   setSuccess(true)
  }catch(e){setError(e.message||'Submission failed. Please try again.')}finally{setBusy(false)}
 }
 if(success)return <div className="career-success" role="status"><span aria-hidden="true">✓</span><h3>Application received.</h3><p>Thank you for your interest in Valoria Institute. Your application has been recorded. If your experience aligns with the role, our team will contact you about next steps.</p></div>
 return <form className="career-form" onSubmit={submit}>
  <div className="career-field"><label htmlFor="fullName">Full name <b>*</b></label><input id="fullName" name="fullName" autoComplete="name" required maxLength={120} value={form.fullName} onChange={change} /></div>
  <div className="career-field"><label htmlFor="email">Email address <b>*</b></label><input id="email" name="email" type="email" autoComplete="email" required maxLength={254} value={form.email} onChange={change} /></div>
  <div className="career-field"><label htmlFor="phone">Phone number <b>*</b></label><input id="phone" name="phone" type="tel" autoComplete="tel" required maxLength={40} value={form.phone} onChange={change} /></div>
  <div className="career-field"><label htmlFor="location">Current location <b>*</b></label><input id="location" name="location" autoComplete="address-level2" required maxLength={120} placeholder="City, country" value={form.location} onChange={change} /></div>
  <div className="career-field"><label htmlFor="linkedin">LinkedIn profile <span>Optional</span></label><input id="linkedin" name="linkedin" type="url" placeholder="https://www.linkedin.com/in/…" maxLength={500} value={form.linkedin} onChange={change} /></div>
  <div className="career-field"><label htmlFor="experience">Relevant experience <b>*</b></label><textarea id="experience" name="experience" required minLength={30} maxLength={3000} rows={4} placeholder="Summarise your experience in partnerships, business development or relationship management." value={form.experience} onChange={change}/></div>
  <div className="career-field"><label htmlFor="achievement">A partnership or business-development outcome <b>*</b></label><textarea id="achievement" name="achievement" required minLength={30} maxLength={3000} rows={4} placeholder="Describe a relationship or opportunity you helped turn into a measurable result." value={form.achievement} onChange={change}/></div>
  <div className="career-field"><label htmlFor="motivation">Why Valoria Institute? <b>*</b></label><textarea id="motivation" name="motivation" required minLength={20} maxLength={2000} rows={3} placeholder="Tell us what interests you about this role." value={form.motivation} onChange={change}/></div>
  <div className="career-field"><label htmlFor="cv">CV / résumé <b>*</b></label><input id="cv" name="cv" type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" required onChange={e=>setCv(e.target.files?.[0]||null)}/><small>PDF, DOC or DOCX · Maximum 4 MB · Required</small></div>
  <div className="career-honeypot" aria-hidden="true"><label htmlFor="website">Leave this field empty</label><input id="website" name="website" tabIndex="-1" autoComplete="off" value={form.website} onChange={change}/></div>
  <label className="career-consent"><input type="checkbox" name="consent" checked={form.consent} onChange={change} required/><span>I consent to Valoria Institute processing the information and CV I submit for recruitment purposes, in line with its <a href="/privacypolicy" target="_blank" rel="noreferrer">Privacy Policy</a>. <b>*</b></span></label>
  {error&&<p className="career-error" role="alert">{error}</p>}
  <button className="careers-apply-button career-submit" type="submit" disabled={busy}>{busy?'SUBMITTING APPLICATION…':'SUBMIT APPLICATION'} <span aria-hidden="true">↗</span></button>
  <p className="career-privacy-note">Your application is private and accessible only to authorised recruitment administrators. Please do not include sensitive personal information unrelated to your application.</p>
 </form>
}
