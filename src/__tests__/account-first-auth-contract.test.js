const fs = require('fs')
const path = require('path')

function read(relative) {
  return fs.readFileSync(path.join(process.cwd(), relative), 'utf8')
}

describe('account-first authentication journey', () => {
  test('shared auth modal creates accounts without assigning a pathway or creating a profile', () => {
    const modal = read('src/components/AuthModal.jsx')
    expect(modal).toContain("supabase.auth.signUp")
    expect(modal).toContain("data: { display_name: form.name.trim() }")
    expect(modal).toContain("emailRedirectTo: new URL('/auth/callback', window.location.origin).toString()")
    expect(modal).toContain("redirectTo: new URL('/reset-password', window.location.origin).toString()")
    expect(modal).toContain('form.confirmPassword')
    expect(modal).toContain('validatePassword')
    expect(modal).not.toContain("from('profiles')")
    expect(modal).not.toContain('user_type:')
  })

  test('navigation exposes sign-in and create-account modals on desktop and mobile', () => {
    const nav = read('src/components/Nav.jsx')
    expect(nav).toContain("setAuthModal('signin')")
    expect(nav).toContain("setAuthModal('signup')")
    expect(nav).toContain('<AuthModal')
    expect(nav).toContain("window.location.assign('/signup')")
  })

  test('legacy signup URL opens the unified account-first registration experience', () => {
    const signup = read('src/app/signup/page.jsx')
    expect(signup).toContain('AuthModal')
    expect(signup).toContain('initialMode="signup"')
    expect(signup).not.toContain('BUYER_TYPES')
    expect(signup).not.toContain("from('profiles')")
  })

  test('new authenticated accounts choose a pathway on the dashboard before profile creation', () => {
    const dashboard = read('src/app/dashboard/page.jsx')
    expect(dashboard).toContain("choosePathway('professional')")
    expect(dashboard).toContain("choosePathway('employer')")
    expect(dashboard).toContain("choosePathway('organiser')")
    expect(dashboard).toContain("supabase.auth.updateUser")
    expect(dashboard).toContain(".from('profiles')")
    expect(dashboard).toContain("window.location.assign('/assessment/start')")
  })

  test('professional assessment entry passes the active session through tab-scoped storage, never a URL', () => {
    const start = read('src/app/assessment/start/page.jsx')
    expect(start).toContain('supabase.auth.getSession()')
    expect(start).toContain("sessionStorage.setItem('valoria-assessment-auth'")
    expect(start).toContain("window.location.replace('/valu/assessment/')")
    expect(start).not.toContain('access_token=')
  })

  test('email confirmation keeps the account signed in and returns to dashboard', () => {
    const callback = read('src/app/auth/callback/page.jsx')
    expect(callback).toContain("router.replace('/dashboard?welcome=profile')")
    expect(callback).toContain('exchangeCodeForSession')
  })
})
