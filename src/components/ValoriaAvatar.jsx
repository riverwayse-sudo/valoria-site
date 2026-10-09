'use client'

import { useMemo } from 'react'

const DEFAULT_AVATARS = [
  '/avatars/valoria-01.svg',
  '/avatars/valoria-02.svg',
  '/avatars/valoria-03.svg',
  '/avatars/valoria-04.svg',
  '/avatars/valoria-05.svg',
  '/avatars/valoria-06.svg',
]

function stableIndex(seed) {
  const value = String(seed || 'valoria')
  let hash = 0
  for (let i = 0; i < value.length; i += 1) hash = ((hash << 5) - hash + value.charCodeAt(i)) | 0
  return Math.abs(hash) % DEFAULT_AVATARS.length
}

export default function ValoriaAvatar({ src, seed, alt = '', className = '', size = 64 }) {
  const fallback = useMemo(() => DEFAULT_AVATARS[stableIndex(seed)], [seed])
  const source = src || fallback

  return (
    <span
      className={className}
      style={{ display:'block', width:size, height:size, overflow:'hidden', borderRadius:'50%', flexShrink:0, background:'#EDE8DC' }}
      aria-hidden={!alt}
    >
      <img
        src={source}
        alt={alt}
        width={size}
        height={size}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        style={{ display:'block', width:'100%', height:'100%', objectFit:'cover' }}
        onError={(event) => {
          if (event.currentTarget.src.endsWith(fallback)) return
          event.currentTarget.src = fallback
        }}
      />
    </span>
  )
}
