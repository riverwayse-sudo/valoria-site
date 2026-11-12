const fs = require('fs')
const path = require('path')

function read(relative) {
  return fs.readFileSync(path.join(process.cwd(), relative), 'utf8')
}

describe('VALU presentation consistency', () => {
  test('homepage communicates registration before the VALU taster without exposing question counts', () => {
    const home = read('src/app/page.jsx')
    expect(home).toContain('Start with your VALU Index Taster')
    expect(home).toContain('START THE VALU INDEX TASTER')
    expect(home).not.toContain('FREE ENTRY')
    expect(home).not.toContain('verified profiles')
    expect(home).not.toContain('target="_blank"')
    const tasterPage = read('src/app/valu/start/page.jsx')
    expect(tasterPage).toContain('VALU INDEX TASTER')
    expect(tasterPage).not.toContain('VALU TASTER')
    expect(tasterPage).not.toMatch(/\bFREE\b|Is it free\?/i)
    expect(tasterPage).not.toMatch(/Basic marketplace consideration|Full marketplace eligibility|buyer access/i)
    expect(read('src/app/signup/page.jsx')).toContain('START THE VALU INDEX TASTER')
    expect(read('src/app/signup/page.jsx')).not.toContain('TAKE THE VALU TASTER')
    expect(home).not.toMatch(/9 questions|58 questions|Question\s+\d+\s+of\s+\d+/i)
    expect(home).not.toContain('Register before your taster')
    expect(home).not.toContain('no account needed')
    expect(home).toContain('Build a stronger professional presence.')
    expect(home).not.toContain('Build a verified professional presence.')
    expect(home).not.toMatch(/\\b9\\s*QUESTIONS\\b|\\b58\\s*QUESTIONS\\b/i)
    const waitlist = read('src/components/WaitlistModal.jsx')
    expect(waitlist).not.toMatch(/\\b9\\s*QUESTIONS\\b|\\b58\\s*QUESTIONS\\b/i)
  })
  test('participant-facing surfaces use VALU Index as the product name', () => {
    const surfaces = [
      read('src/app/valu/page.jsx'),
      read('src/app/valu/start/page.jsx'),
      read('src/app/dashboard/page.jsx'),
      read('src/app/profile/setup/page.jsx'),
      read('src/components/MarketplaceDirectory.jsx'),
      read('src/app/professional-signup/page.jsx'),
      read('src/app/privacypolicy/page.jsx'),
      read('src/app/profile/onboarding/page.jsx'),
      read('src/components/VALUJourneyProgress.jsx'),
      read('src/app/prime/page.jsx'),
      read('src/app/test/assessment/page.jsx'),
      read('src/app/insights/page.jsx'),
      read('src/app/login/page.jsx'),
      read('src/app/api/link-taster/route.js'),
      read('src/app/api/valu-handoff/route.js'),
      read('src/app/signup/page.jsx'),
      read('src/components/LiveProfilesScroll.jsx'),
      read('src/app/profile/[id]/ProfileClient.jsx'),
      read('src/app/admin/reconciliation/page.jsx'),
      read('src/components/Nav.jsx'),
      read('src/components/ValoriaJourneyCards.jsx'),
      read('src/lib/journey-state.js'),
      read('src/app/auth/callback/page.jsx'),
    ];
    for (const surface of surfaces) {
      expect(surface).not.toMatch(/VALU\s+assessment/i);
      expect(surface).not.toMatch(/VALU\s+Index\s+assessment/i);
      expect(surface).not.toMatch(/\bVALU\s+(?!Index\b)[A-Za-z]+/i);
      expect(surface).not.toMatch(/VALU\s+taster(?!\s+index)/i);
    }
    expect(read('src/app/valu/page.jsx')).toContain('VALU Index Taster');
    expect(read('src/app/valu/start/page.jsx')).toContain('separate full assessment')
    expect(read('src/app/valu/start/page.jsx')).toContain('official VALU Index');
    expect(read('src/app/page.jsx')).toContain('START THE VALU INDEX TASTER');
    expect(read('src/app/prime/page.jsx')).toContain('TAKE THE VALU INDEX TASTER');
    expect(read('src/app/insights/page.jsx')).toContain('START THE VALU INDEX TASTER');
    expect(read('src/app/signup/page.jsx')).toContain('START THE VALU INDEX TASTER');
    const homepageRail = read('src/components/LiveProfilesScroll.jsx')
    expect(homepageRail).not.toContain('WANT TO BE DISCOVERED')
    expect(homepageRail).not.toContain('relevant buyers understand your capabilities');
  })

  test('homepage VALU card uses the approved points-based PRIME presentation', () => {
    const hero = read('src/components/HeroSlider.jsx')
    expect(hero).toContain('START THE VALU INDEX TASTER')
    expect(hero).not.toContain('TAKE THE VALU TASTER')
    expect(hero).not.toContain('VALU Index assessment structure')
    expect(hero).toContain('POINTS-BASED CAPABILITY PROFILE')
    expect(hero).toContain('PRIME framework · results expressed in points')
    for (const cluster of ['Presence', 'Relationships', 'Intelligence', 'Mastery', 'Enterprise']) {
      expect(hero).toContain(cluster)
    }
    expect(hero).not.toContain('/ 100')
  })
  test('public registry and professional-facing score cards use points', () => {
    expect(read('src/components/LiveProfilesScroll.jsx')).toContain('vi-scroll-score-max">points')
    expect(read('src/app/profile/[id]/ProfileClient.jsx')).toContain('> points</span>')
    expect(read('src/app/profile/onboarding/page.jsx')).toContain('<span> points</span>')
    expect(read('src/app/profile/passport/page.jsx')).toContain(' points</b>')
    expect(read('src/app/profile/settings/page.jsx')).toContain(' points</strong>')
    expect(read('src/components/ValueActivationCard.jsx')).toContain('points')
  })

  test('legacy stored designation strings cannot override the canonical points-based merit bands', () => {
    expect(read('src/app/dashboard/page.jsx')).not.toContain('p.designation.replace')
    expect(read('src/app/report/page.jsx')).not.toContain('assessment.designation ||')
    expect(read('src/app/profile/[id]/ProfileClient.jsx')).not.toContain('p.designation.replace')
    expect(read('src/app/profile/onboarding/page.jsx')).not.toContain('valu.designation ||')
    expect(read('src/app/profile/passport/page.jsx')).not.toContain('profile?.designation||')
  })

  test('every remaining designation-bearing journey and server projection derives merit from canonical points', () => {
    const journeyState = read('src/lib/journey-state.js')
    expect(journeyState).not.toContain('assessment?.designation')
    expect(journeyState).not.toContain('profile?.designation')

    const journeyRoute = read('src/app/api/journey/state/route.js')
    const diagnosticsRoute = read('src/app/api/journey/diagnostics/route.js')
    for (const route of [journeyRoute, diagnosticsRoute]) {
      expect(route).toContain("getValuTier(state.assessment.score, 'full')?.name")
      expect(route).not.toMatch(/total_score,designation/)
    }

    const profileSetup = read('src/app/profile/setup/page.jsx')
    expect(profileSetup).not.toContain('designation: assessment.designation')
    expect(profileSetup).toContain("getValuTier(assessment.total_score, 'full')?.name")

    const adminAnalytics = read('src/app/api/admin/analytics/route.js')
    expect(adminAnalytics).not.toMatch(/industry, designation, p_score/)
    expect(adminAnalytics).toContain("getValuTier(a.total_score, 'full')?.name")

    const employerApplications = read('src/app/api/employer/applications/route.js')
    expect(employerApplications).not.toMatch(/valu_index,designation/)
    expect(employerApplications).toContain("getValuTier(profile.valu_index, 'full')?.name")

    const publicProfile = read('src/lib/public-profile.js')
    expect(publicProfile).not.toContain("  'designation',")
    expect(publicProfile).toContain("getValuTier(profile.valu_index, 'full')?.name")
  })

  test('email confirmation never exposes internal taster or full-assessment question counts', () => {
    const callback = read('src/app/auth/callback/page.jsx')
    expect(callback).not.toMatch(/opening nine|9-question|58-question|Question\s+\d+\s+of\s+\d+/i)
    expect(callback).toContain('your saved VALU Index Taster is connected')
  })

  test('public marketplace and homepage merit labels are derived from canonical VALU points, not stored legacy labels', () => {
    const directory = read('src/components/MarketplaceDirectory.jsx')
    const homepage = read('src/components/LiveProfilesScroll.jsx')
    expect(directory).toContain("getValuTier(p.valu_index, 'full')")
    expect(directory).not.toContain('displayText(p.designation)')
    expect(directory).toContain("styles[tier.name.toLowerCase()]")
    expect(homepage).toContain("getValuTier(profile.valu_index, 'full')")
    expect(homepage).not.toContain('displayText(profile.designation)')
    const adminRoster = read('src/app/admin/marketplace-roster/page.jsx')
    expect(adminRoster).toContain("getValuTier(profile.valu_points, 'full')")
    expect(adminRoster).not.toContain('profile.designation.toUpperCase()')
  })

  test('the shared score display contract declares points, not a percentage suffix', () => {
    const brand = read('src/lib/brand.js')
    expect(brand).toContain("unit: 'points'")
    expect(brand).toContain("displaySuffix: 'points'")
    expect(brand).not.toContain("displaySuffix: '/100'")
  })

  test('the assessment prototype is explicitly non-production and hides internal question mechanics', () => {
    const prototype = read('src/app/test/assessment/page.jsx')
    expect(prototype).toContain('This is a shortened prototype only.')
    expect(prototype).toContain('does not create an account, send email or store your responses')
    expect(prototype).not.toMatch(/Question\s+\d+\s+of\s+\d+/i)
    expect(prototype).not.toMatch(/9 opening questions|remaining 49 questions|58 in total/i)
  })
  test('avatar upload types and size are restricted in the client and storage bucket', () => {
    const helper = read('src/lib/avatar-upload.js')
    expect(helper).toContain("'image/jpeg': 'jpg'")
    expect(helper).toContain("'image/png': 'png'")
    expect(helper).toContain("'image/webp': 'webp'")
    expect(helper).toContain('5 * 1024 * 1024')
    expect(helper).toContain('file.size > AVATAR_MAX_BYTES')

    for (const version of ['20261112121343', '20261112121356']) {
      const migration = read(`supabase/migrations/${version}_restrict_avatar_upload_size_and_mime_types.sql`)
      expect(migration).toContain('file_size_limit = 5242880')
      expect(migration).toContain("ARRAY['image/jpeg', 'image/png', 'image/webp']")
      expect(migration).toContain("WHERE id = 'avatars' AND public = true")
      expect(migration).not.toContain('SET public')
    }

    for (const path of ['src/app/profile/edit/page.jsx', 'src/app/profile/setup/page.jsx']) {
      const page = read(path)
      expect(page).toContain('getAvatarExtension(file)')
      expect(page).toContain('contentType: file.type')
      expect(page).not.toContain("file.name.split('.').pop()")
    }
  })


  test('private CV uploads have matching client and Storage size/type limits', () => {
    const helper = read('src/lib/upload-professional-cv.js')
    expect(helper).toContain('10 * 1024 * 1024')
    expect(helper).toContain('file.type !== mimeType')
    expect(helper).toContain("contentType: mimeType")

    for (const version of ['20261112121608', '20261112121613']) {
      const migration = read(`supabase/migrations/${version}_restrict_private_cv_upload_size_and_mime_types.sql`)
      expect(migration).toContain('file_size_limit = 10485760')
      expect(migration).toContain("'application/pdf'")
      expect(migration).toContain("'application/msword'")
      expect(migration).toContain("'application/vnd.openxmlformats-officedocument.wordprocessingml.document'")
      expect(migration).toContain("WHERE id = 'cvs' AND public = false")
    }
  })


  test('legacy archive security migration is versioned for both environments and idempotent', () => {
    for (const version of ['20261112120605', '20261112120621']) {
      const migration = read(`supabase/migrations/${version}_revoke_public_legacy_marketplace_archive_access.sql`)
      expect(migration).toContain('DROP POLICY IF EXISTS marketplace_profiles_public_read')
      expect(migration).toContain('REVOKE ALL PRIVILEGES')
      expect(migration).not.toMatch(/\\b(DROP TABLE|TRUNCATE|DELETE FROM)\\b/i)
    }
  })


})
