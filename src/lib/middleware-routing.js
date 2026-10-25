// src/lib/middleware-routing.js
//
// Pure routing decisions for middleware.js, extracted so the logic that caused
// the assessment-asset outage is unit-testable without booting Next.js.
//
// The incident: the VALU assessment SPA is an external application rewritten in
// via next.config.js. Its HTML shell requests hashed
// /valu/assessment/assets/*.js and *.css files. The middleware matcher only
// excluded _next/static and _next/image, and the static-extension allowlist
// covered images and fonts but not js/css — so those requests reached the
// Supabase auth path, and any auth/network failure turned every asset into a
// 500. The page rendered but appeared broken.
//
// CommonJS so it can be required by both middleware.js and the Jest suite.

'use strict'

// Asset extensions that must never reach the auth path. js/css/mjs/map/json are
// the ones that were missing and caused the outage; the rest were already there.
const STATIC_ASSET = /\.(?:png|jpe?g|gif|svg|ico|webp|avif|bmp|js|mjs|cjs|jsx|css|map|json|txt|xml|webmanifest|woff2?|ttf|otf|eot|wasm)$/

// The proxied VALU assessment app is not this site's middleware's business.
const ASSESSMENT_PREFIX = '/valu/assessment'

function isAssessmentRoute(pathname) {
  return pathname === ASSESSMENT_PREFIX || pathname.startsWith(ASSESSMENT_PREFIX + '/')
}

function isStaticAssetPath(pathname) {
  return pathname === '/favicon.ico' || STATIC_ASSET.test(pathname)
}

/**
 * True when the request must skip Supabase auth entirely.
 * Order matters: the assessment bypass is checked first so an asset request
 * under that prefix can never fall through to the auth path.
 */
function shouldBypassAuth(pathname) {
  if (isAssessmentRoute(pathname)) return true
  if (pathname.startsWith('/_next')) return true
  if (pathname.startsWith('/api')) return true
  if (isStaticAssetPath(pathname)) return true
  return false
}

module.exports = { ASSESSMENT_PREFIX, STATIC_ASSET, isAssessmentRoute, isStaticAssetPath, shouldBypassAuth }
