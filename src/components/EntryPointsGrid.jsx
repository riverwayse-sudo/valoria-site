'use client'

const POINTS = [
  { key:'ep-1', name:<>ATB<br/>Connect</>, buyer:'For Employers & Recruiters', desc:'Search assessed professionals through structured capability data and relevant professional context. Precision hiring begins with a clearer signal.', modality:'PRECISION TALENT SOURCING', liveHref:'/marketplace/talent' },
  { key:'ep-2', name:<>ATB<br/>Spotlight</>, buyer:'For Event Organisers', desc:'Discover voices by expertise, demonstrated capability and merit—not familiarity or network proximity.', modality:'MERIT-BASED VISIBILITY', liveHref:'/marketplace/speakers' },
  { key:'ep-3', name:<>Valoria<br/>Develop</>, buyer:'For Professionals & Organisations', desc:'Build capability through PRIME-mapped development designed around the gaps that matter most.', modality:'CAPABILITY DEVELOPMENT', liveHref:'/programmes' },
]

export default function EntryPointsGrid() {
  return <>{POINTS.map(p=><div key={p.key} className={'ep-card '+p.key} style={{'--ep-color':'#C9A84C'}}>
    <style>{'.'+p.key+'::before { background:#C9A84C; }'}</style>
    <div className="ep-icon" style={{background:'rgba(201,168,76,.08)',border:'1px solid rgba(201,168,76,.25)',color:'#C9A84C'}}>✦</div>
    <h3 className="ep-name" style={{color:'#C9A84C'}}>{p.name}</h3>
    <div className="ep-buyer" style={{color:'#C9A84C'}}>{p.buyer}</div>
    <p className="ep-desc-text">{p.desc}</p>
    <div className="ep-modality" style={{background:'rgba(201,168,76,.08)',color:'#C9A84C',border:'1px solid rgba(201,168,76,.22)'}}>{p.modality}</div>
    <a href={p.liveHref} className="ep-link" style={{color:'#C9A84C'}}>Explore <span>→</span></a>
  </div>)}</>
}
