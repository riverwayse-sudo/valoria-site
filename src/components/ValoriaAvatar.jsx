'use client'

import { useMemo, useState } from 'react'

function getInitials(name) {
  const parts = String(name || '').normalize('NFKC').trim().split(/\\s+/).filter(Boolean)
  if (!parts.length) return 'V'
  return parts.length === 1
    ? parts[0].slice(0, 1).toUpperCase()
    : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export default function ValoriaAvatar({ src, name, seed, alt = '', className = '', size = 64 }) {
  const [imageFailed, setImageFailed] = useState(false)
  const initials = useMemo(() => getInitials(name), [name])
  const showImage = Boolean(src && !imageFailed)

  return (
    <span
      className={className}
      style={{
        display:'flex', alignItems:'center', justifyContent:'center',
        width:size, height:size, overflow:'hidden', borderRadius:'50%',
        flexShrink:0, background:'#1A1A2E', color:'#C9A84C',
        border:'1px solid #C9A84C', fontWeight:800, letterSpacing:'-.04em',
        fontSize:Math.max(14, Math.round(size * 0.34)), lineHeight:1,
      }}
      role={alt ? 'img' : undefined}
      aria-label={alt || undefined}
      aria-hidden={!alt}
    >
      {showImage ? (
        <img
          src={src}
          alt=""
          width={size}
          height={size}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          style={{ display:'block', width:'100%', height:'100%', objectFit:'cover' }}
          onError={() => setImageFailed(true)}
        />
      ) : initials}
    </span>
  )
}
