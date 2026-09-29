import {NextResponse} from 'next/server'
import {createServerClient} from '@supabase/ssr'
import {createClient} from '@supabase/supabase-js'
const URL=process.env.NEXT_PUBLIC_SUPABASE_URL,ANON=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,SERVICE=process.env.SUPABASE_SERVICE_ROLE_KEY
const TYPES=new Set(['profile_view','enquiry','invite','application','shortlisted','introduced','interview','selected','declined','engaged','completed'])
export async function POST(request){
 if(!URL||!ANON||!SERVICE)return NextResponse.json({error:'Service unavailable'},{status:503})
 const sb=createServerClient(URL,ANON,{cookies:{getAll:()=>request.cookies.getAll(),setAll:()=>{}}});const {data:{user}}=await sb.auth.getUser();if(!user)return NextResponse.json({error:'Authentication required'},{status:401})
 let body={};try{body=await request.json()}catch{return NextResponse.json({error:'Invalid request'},{status:400})}
 if(!TYPES.has(body.event_type))return NextResponse.json({error:'Unsupported outcome event'},{status:400})
 const admin=createClient(URL,SERVICE,{auth:{persistSession:false,autoRefreshToken:false}})
 const {data,error}=await admin.from('professional_outcome_events').insert({professional_id:user.id,capability_id:body.capability_id||null,opportunity_id:body.opportunity_id||null,event_type:body.event_type,metadata:body.metadata||{}}).select('id,event_type,occurred_at').single()
 if(error)return NextResponse.json({error:error.message},{status:500})
 return NextResponse.json({ok:true,event:data})
}

export async function GET(request){
 if(!URL||!ANON||!SERVICE)return NextResponse.json({error:'Service unavailable'},{status:503})
 const sb=createServerClient(URL,ANON,{cookies:{getAll:()=>request.cookies.getAll(),setAll:()=>{}}});const {data:{user}}=await sb.auth.getUser();if(!user)return NextResponse.json({error:'Authentication required'},{status:401})
 const admin=createClient(URL,SERVICE,{auth:{persistSession:false,autoRefreshToken:false}})
 const {data,error}=await admin.from('professional_outcome_events').select('id,event_type,opportunity_id,capability_id,metadata,occurred_at').eq('professional_id',user.id).order('occurred_at',{ascending:false}).limit(100)
 if(error)return NextResponse.json({error:error.message},{status:500})
 const summary=(data||[]).reduce((a,e)=>(a[e.event_type]=(a[e.event_type]||0)+1,a),{})
 return NextResponse.json({events:data||[],summary})
}