'use client'

import WaitlistForm from './WaitlistForm'

export default function HomeWaitlistSection() {
  return (
    <>
      <style>{`
        .home-waitlist{padding:clamp(72px,9vw,120px) var(--pad);background:var(--parchment);border-top:1px solid rgba(26,26,46,.10);border-bottom:1px solid rgba(26,26,46,.10)}
        .home-waitlist-inner{max-width:1180px;margin:0 auto;display:grid;grid-template-columns:minmax(0,.85fr) minmax(0,1.15fr);gap:clamp(36px,6vw,88px);align-items:center}
        .home-waitlist-kicker,.wl-kicker{display:flex;align-items:center;gap:10px;font-size:9px;font-weight:800;letter-spacing:.20em;color:#8f6c25;text-transform:uppercase}
        .home-waitlist-kicker span,.wl-kicker span{width:28px;height:1px;background:#C9A84C;display:block}
        .home-waitlist-copy h2{font-family:var(--font);font-size:clamp(38px,5vw,66px);font-weight:300;line-height:1.04;letter-spacing:-.025em;color:var(--dark);margin:18px 0}
        .home-waitlist-copy h2 em{font-weight:400;color:#8f6c25}
        .home-waitlist-copy>p{max-width:500px;font-size:15px;line-height:1.8;color:rgba(26,26,46,.62);margin:0}
        .home-waitlist-points{display:flex;flex-wrap:wrap;gap:9px 22px;margin-top:28px;padding-top:20px;border-top:1px solid rgba(26,26,46,.12)}
        .home-waitlist-points span{font-size:9px;font-weight:800;letter-spacing:.12em;color:rgba(26,26,46,.48);text-transform:uppercase}
        .home-waitlist-form{min-width:0}
        .waitlist-card{background:#FAFAF7!important;border:1px solid rgba(26,26,46,.14)!important;border-radius:8px!important;box-shadow:0 18px 50px rgba(26,26,46,.08)!important;padding:clamp(24px,4vw,42px)!important;color:#1A1A2E!important}
        .waitlist-card .wl-card-head{margin-bottom:24px}.waitlist-card .wl-card-head h3{font-family:var(--font);font-size:28px;font-weight:400;color:#1A1A2E;margin:10px 0 6px}.waitlist-card .wl-card-head p{font-size:13px;color:rgba(26,26,46,.52);margin:0}
        .wl-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px 14px}.wl-field-wrap{display:flex;flex-direction:column;gap:7px}.wl-field-wrap>span{font-size:9px;font-weight:800;letter-spacing:.14em;color:rgba(26,26,46,.56);text-transform:uppercase}.wl-field-wrap b{color:#A67C20}
        .wl-field{width:100%;min-height:48px;padding:12px 13px;border:1px solid rgba(26,26,46,.16);border-radius:5px;background:#fff;color:#1A1A2E;font:400 14px var(--font);outline:none;transition:border-color .2s,box-shadow .2s,background .2s;box-sizing:border-box}.wl-field::placeholder{color:rgba(26,26,46,.32)}.wl-field:focus{border-color:#C9A84C;box-shadow:0 0 0 3px rgba(201,168,76,.12)}.wl-field-wrap select{appearance:auto}
        .wl-submit-row{margin-top:22px}.wl-btn{width:100%;min-height:52px;border:1px solid #C9A84C;border-radius:5px;background:#C9A84C;color:#1A1A2E;font:800 10px var(--font);letter-spacing:.13em;cursor:pointer;transition:transform .2s,background .2s,box-shadow .2s}.wl-btn span{font-size:15px;margin-left:8px}.wl-btn:hover:not(:disabled){transform:translateY(-1px);background:#D4B55F;box-shadow:0 8px 22px rgba(26,26,46,.12)}.wl-btn:disabled{opacity:.45;cursor:not-allowed}.wl-submit-row small{display:block;margin-top:10px;font-size:10px;line-height:1.5;color:rgba(26,26,46,.40)}.wl-error{margin-top:14px;padding:10px 12px;border-left:2px solid #D85A30;background:rgba(216,90,48,.06);font-size:12px;color:#A64224}.wl-success-mark{width:46px;height:46px;border-radius:50%;display:grid;place-items:center;background:rgba(201,168,76,.12);border:1px solid rgba(201,168,76,.35);color:#8f6c25;font-weight:800;margin-bottom:18px}.waitlist-card .wl-success-kicker{font-size:9px;font-weight:800;letter-spacing:.16em;color:#8f6c25}.waitlist-card .wl-success-mark+h3{font-family:var(--font);font-size:28px;font-weight:400;color:#1A1A2E;margin:9px 0}.waitlist-card .wl-success-mark+h3+p{font-size:14px;line-height:1.7;color:rgba(26,26,46,.55);margin:0}
        @media(max-width:900px){.home-waitlist-inner{grid-template-columns:1fr}.home-waitlist-copy{max-width:680px}.wl-form-grid{grid-template-columns:1fr 1fr}}
        @media(max-width:560px){.home-waitlist{padding:64px var(--pad)}.home-waitlist-copy h2{font-size:40px}.wl-form-grid{grid-template-columns:1fr}.waitlist-card{padding:22px!important}.home-waitlist-points{display:grid;gap:10px}}
      `}</style>
      <section className="home-waitlist" id="join" aria-labelledby="home-waitlist-title">
        <div className="home-waitlist-inner">
          <div className="home-waitlist-copy">
            <div className="home-waitlist-kicker"><span /> FOUNDING COHORT</div>
            <h2 id="home-waitlist-title">Be early to the<br /><em>professional standard.</em></h2>
            <p>Valoria is building a trusted infrastructure for developing, assessing and connecting professional capability. Join the founding cohort and be part of what comes next.</p>
            <div className="home-waitlist-points"><span>01 · Early access</span><span>02 · Product updates</span><span>03 · Founding opportunities</span></div>
          </div>
          <div className="home-waitlist-form"><WaitlistForm compact /></div>
        </div>
      </section>
    </>
  )
}
