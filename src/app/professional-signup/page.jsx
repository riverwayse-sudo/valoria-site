'use client'
import {useMemo,useState,Suspense} from 'react'
import {useSearchParams} from 'next/navigation'
import {useRouter} from 'next/navigation'
import Link from 'next/link'
import {supabase} from '@/lib/supabase'

const GOLD='#C9A84C',DARK='#0F0F1A',PARCH='#F7F4EE',DIM='rgba(247,244,238,.55)'
function Form(){
 const q=useSearchParams(),router=useRouter()
 const tasterId=q.get('taster_id')||'',name=q.get('name')||'',role=q.get('role')||''
 const [f,setF]=useState({email:'',password:'',confirm:''}),[busy,setBusy]=useState(false),[error,setError]=useState('')
 const valid=useMemo(()=>tasterId&&name&&role&&f.email&&f.password.length>=8&&f.password===f.confirm,[tasterId,name,role,f])
 async function submit(e){e.preventDefault();if(!valid)return;setBusy(true);setError('');try{
  const{data,error:signupError}=await supabase.auth.signUp({email:f.email.trim().toLowerCase(),password:f.password,options:{emailRedirectTo:`${window.location.origin}/profile/onboarding?pending_taster_id=${encodeURIComponent(tasterId)}`,data:{display_name:name,full_name:name,user_type:'professional',role,pending_taster_id:tasterId}}})
  if(signupError)throw signupError
  if(data?.session?.access_token){
   const res=await fetch('/api/link-taster',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${data.session.access_token}`},body:JSON.stringify({taster_id:tasterId,name,role})})
   if(!res.ok){const x=await res.json().catch(()=>({}));throw new Error(x.error||'Your VALU result could not be linked.')}
   router.replace('/profile/onboarding')
  }else{
   localStorage.setItem('pending_taster_id',tasterId)
   router.replace('/login?next=%2Fprofile%2Fonboarding')
  }
 }catch(e){setError(e?.message||'Something went wrong. Please try again.');setBusy(false)}}
 if(!tasterId||!name||!role)return <Shell><h1 style={S.title}>Your VALU journey needs a result.</h1><p style={S.sub}>Start with the 15-question VALU Index. Your completed result is the entry point to a professional account.</p><a href="https://assessment.valoriainstitute.com/" style={S.button}>TAKE THE VALU INDEX →</a></Shell>
 return <Shell><div style={S.eyebrow}>VALU INDEX COMPLETE · ACCOUNT → PROFILE</div><h1 style={S.title}>Create your <em>Valoria account.</em></h1><p style={S.sub}>Hi {name.split(/\s+/)[0]}. Your assessment is already part of your journey. Create the account once; then Valoria will take you directly into a saved professional profile.</p><div style={S.summary}><b>{name}</b><span>{role}</span><small>Your account, professional profile and future capabilities remain one connected record.</small></div><form onSubmit={submit} style={S.form}><Field label="EMAIL"><input type="email" required value={f.email} onChange={e=>setF({...f,email:e.target.value})} placeholder="you@example.com" style={S.input}/></Field><Field label="PASSWORD"><input type="password" required minLength={8} value={f.password} onChange={e=>setF({...f,password:e.target.value})} placeholder="Minimum 8 characters" style={S.input}/></Field><Field label="CONFIRM PASSWORD"><input type="password" required minLength={8} value={f.confirm} onChange={e=>setF({...f,confirm:e.target.value})} placeholder="Repeat your password" style={S.input}/></Field>{error&&<div style={S.error}>{error}</div>}<button disabled={busy||!valid} style={{...S.button,opacity:(busy||!valid)?0.5:1}}>{busy?'CREATING ACCOUNT…':'CREATE ACCOUNT →'}</button></form><div style={S.next}><b>WHAT HAPPENS NEXT</b><span>01 · Account created</span><span>02 · Professional profile saved</span><span>03 · Capability and evidence added when ready</span><span>04 · Full VALU assessment remains authoritative</span><span>05 · Eligibility and listing are governed separately</span></div></Shell>
}
function Field({label,children}){return <label style={S.field}><span>{label}</span>{children}</label>}
function Shell({children}){return <main style={S.page}><div style={S.card}><Link href="/" style={S.brand}>VALORIA INSTITUTE</Link>{children}<p style={S.login}>Already have an account? <Link href="/login">Sign in</Link></p></div></main>}
const S={page:{minHeight:'100vh',background:DARK,color:PARCH,display:'flex',alignItems:'center',justifyContent:'center',padding:'60px 20px',fontFamily:"'Raleway',sans-serif"},card:{width:'100%',maxWidth:620,background:'rgba(26,26,46,.72)',border:'1px solid rgba(201,168,76,.18)',padding:'clamp(28px,6vw,54px)',borderRadius:12},brand:{display:'inline-block',color:GOLD,textDecoration:'none',fontSize:10,fontWeight:800,letterSpacing:'.16em',marginBottom:34},eyebrow:{color:GOLD,fontSize:10,fontWeight:800,letterSpacing:'.16em',marginBottom:14},title:{fontSize:'clamp(34px,6vw,58px)',fontWeight:300,lineHeight:1.04,margin:'0 0 18px'},sub:{color:DIM,fontSize:14,lineHeight:1.75,margin:'0 0 24px'},summary:{display:'grid',gap:6,padding:18,background:'rgba(201,168,76,.05)',border:'1px solid rgba(201,168,76,.15)',marginBottom:24},'summary span':{fontSize:12,color:GOLD},'summary small':{fontSize:11,color:DIM,lineHeight:1.5},form:{display:'grid',gap:15},field:{display:'grid',gap:7},'field span':{fontSize:10,fontWeight:800,letterSpacing:'.1em',color:DIM},input:{padding:'13px 14px',background:'rgba(255,255,255,.04)',border:'1px solid rgba(247,244,238,.12)',color:PARCH,fontFamily:'inherit',fontSize:14,borderRadius:5},button:{width:'100%',padding:15,border:0,borderRadius:999,background:GOLD,color:DARK,fontWeight:800,letterSpacing:'.12em',fontFamily:'inherit',cursor:'pointer'},error:{padding:12,background:'rgba(216,90,48,.08)',border:'1px solid rgba(216,90,48,.3)',color:'#F09595',fontSize:12},next:{display:'grid',gap:7,marginTop:28,padding:18,background:'rgba(255,255,255,.02)',border:'1px solid rgba(247,244,238,.07)',fontSize:11,color:DIM},'next b':{fontSize:9,color:'rgba(201,168,76,.55)',letterSpacing:'.14em',marginBottom:4},login:{textAlign:'center',color:'rgba(247,244,238,.35)',fontSize:12,margin:'24px 0 0'},'login a':{color:GOLD}}
