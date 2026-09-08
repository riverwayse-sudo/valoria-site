'use client'
import { BRAND } from '@/lib/brand'
import MarketplaceCTA from './MarketplaceCTA'

export default function HeroSlider() {
  const bars=[88,90,82,80,75]
  const scores=[['P',88],['R',90],['I',82],['M',80],['E',75]]
  return <section className="hero" id="hero">
    <div className="hero-bg" aria-hidden="true" /><div className="hero-grid" aria-hidden="true" />
    <div className="hero-slides"><div className="hero-slide is-active"><div className="container hero-inner">
      <div>
        <div className="hero-eyebrow au d1"><div className="hero-eyebrow-line" /><span className="hero-eyebrow-text">AFRICA'S HUMAN CAPITAL INSTITUTION</span></div>
        <h1 className="hero-title au d2">Talent is not<br />the problem.<br /><em>Infrastructure is.</em></h1>
        <p className="hero-sub au d3">Valoria Institute builds the infrastructure through which African professional merit is developed, surfaced and connected to opportunity with precision.</p>
        <div className="hero-actions au d4"><a href={BRAND.assessmentUrl} target="_blank" rel="noopener noreferrer" className="btn-gold">BEGIN THE VALU SNAPSHOT</a><MarketplaceCTA className="btn-outline">EXPLORE THE BUREAU</MarketplaceCTA></div>
        <div className="hero-mobile-card au d5" aria-hidden="true"><div className="hmc-row"><div className="hmc-score">84</div><div className="hmc-right"><div className="hmc-desig">DISTINGUISHED · ✦✦</div><div className="hmc-bars">{bars.map((w,i)=><div key={i} className="hmc-bar" style={{background:'#C9A84C',width:w+'%'}} />)}</div></div></div></div>
      </div>
      <div className="valu-card au d4" aria-label="Illustrative VALU profile">
        <div className="vc-label">VALU INDEX · ILLUSTRATIVE PROFILE</div><div className="vc-score"><span className="vc-num">84</span><span className="vc-denom">/ 100</span></div><div className="vc-desig">DISTINGUISHED · ✦✦</div>
        <div className="vc-modalities"><span className="mod-pill" style={{background:'rgba(201,168,76,.1)',color:'#C9A84C',border:'1px solid rgba(201,168,76,.25)'}}>CANDIDATE</span><span className="mod-pill" style={{background:'rgba(201,168,76,.1)',color:'#C9A84C',border:'1px solid rgba(201,168,76,.25)'}}>SPEAKER</span></div>
        <div className="vc-bars">{scores.map(([l,s])=><div className="vb" key={l}><span className="vb-l">{l}</span><div className="vb-bg"><div className="vb-fill" style={{width:s+'%',background:'#C9A84C'}} /></div><span className="vb-s">{s}</span></div>)}</div><div className="vc-foot">illustrative profile · merit made visible</div>
      </div>
    </div></div></div>
    <div className="hero-scroll-cue" aria-hidden="true"><span>Scroll</span><svg width="14" height="8" viewBox="0 0 14 8" fill="none"><path d="M1 1l6 6 6-6" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
  </section>
}
