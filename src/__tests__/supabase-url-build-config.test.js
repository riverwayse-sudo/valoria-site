const path = require('path')

const configPath = path.resolve(process.cwd(), 'next.config.js')
const originalPublicUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const originalServerUrl = process.env.SUPABASE_URL

function loadConfig() {
  jest.resetModules()
  return require(configPath)
}

afterEach(() => {
  if (originalPublicUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL
  else process.env.NEXT_PUBLIC_SUPABASE_URL = originalPublicUrl

  if (originalServerUrl === undefined) delete process.env.SUPABASE_URL
  else process.env.SUPABASE_URL = originalServerUrl

  jest.resetModules()
})

describe('Next.js Supabase build URL normalization', () => {
  test('normalizes public and server URLs before Next.js inlines them', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co/rest/v1/'
    process.env.SUPABASE_URL = 'https://example.supabase.co/rest/v1'

    const config = loadConfig()

    expect(config.env.NEXT_PUBLIC_SUPABASE_URL).toBe('https://example.supabase.co')
    expect(config.env.SUPABASE_URL).toBe('https://example.supabase.co')
  })

  test('uses the available project URL for both public and server clients', () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    process.env.SUPABASE_URL = 'https://example.supabase.co/rest/v1/'

    const config = loadConfig()

    expect(config.env.NEXT_PUBLIC_SUPABASE_URL).toBe('https://example.supabase.co')
    expect(config.env.SUPABASE_URL).toBe('https://example.supabase.co')
  })

  test('rejects an insecure non-local Supabase URL at build time', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://example.supabase.co/rest/v1/'
    process.env.SUPABASE_URL = 'http://example.supabase.co/rest/v1/'

    expect(loadConfig).toThrow('Supabase project URL must use HTTPS')
  })
})
