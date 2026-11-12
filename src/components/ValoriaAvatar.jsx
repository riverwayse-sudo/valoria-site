'use client'

import { useMemo, useState } from 'react'

function getInitials(name) {
  const parts = String(name || '').normalize('NFKC').trim().split(/\\s+/).filter(Boolean)
  if (!parts.length) return 'V'
  return parts.length === 1
    ? parts[0].slice(0, 1).toUpperCase()
    : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

// A deterministic, non-identifying motif keeps photo-less public cards distinct.
// It uses only the opaque public profile key; it never derives or reveals a name.
function getSeededMotif(seed) {
  const value = String(seed || 'valoria')
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  const positions = [0, 1, 2].map((offset) => {
    const part = (hash >>> (offset * 7)) & 127
    return 18 + (part % 65)
  })
  return {
    backgroundImage: `radial-gradient(circle at ${positions[0]}% ${positions[1]}%, rgba(201,168,76,.24) 0 2px, transparent 3px), radial-gradient(circle at ${positions[2]}% ${positions[0]}%, rgba(212,201,168,.16) 0 1px, transparent 3px)`,
  }
}

export default function ValoriaAvatar({ src, name, seed, alt = '', className = '', size = 64 }) {
  const [imageFailed, setImageFailed] = useState(false)
  const initials = useMemo(() => getInitials(name), [name])
  const motif = useMemo(() => getSeededMotif(seed), [seed])
  const showImage = Boolean(src && !imageFailed)

  return (
    <span
      className={className}
      style={{
        display:'flex', alignItems:'center', justifyContent:'center',
        width:size, height:size, overflow:'hidden', borderRadius:'50%',
        flexShrink:0, backgroundColor:'#1A1A2E', backgroundImage: showImage ? 'none' : motif.backgroundImage, color:'#C9A84C',
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
