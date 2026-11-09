const fs = require('fs')
const path = require('path')

const read = file => fs.readFileSync(path.join(process.cwd(), file), 'utf8')

describe('Canonical VALU merit tiers', () => {
  test('public site uses the VALU v4 score bands and names', () => {
    const brand = read('src/lib/brand.js')
    const prime = read('src/app/prime/page.jsx')

    expect(brand).toContain("{ level: 4, min: 90, max: 100, name: 'Elite'")
    expect(brand).toContain("{ level: 3, min: 75, max: 89, name: 'Distinguished'")
    expect(brand).toContain("{ level: 2, min: 55, max: 74, name: 'Proficient'")
    expect(brand).toContain("{ level: 1, min: 35, max: 54, name: 'Standard'")
    expect(brand).not.toContain("name: 'Force to Align With'")
    expect(brand).not.toContain("name: 'Emerging Force'")
    expect(brand).not.toContain("name: 'Developing Professional'")
    expect(brand).not.toContain("name: 'Building Foundations'")

    for (const tier of ['Elite', 'Distinguished', 'Proficient', 'Standard']) {
      expect(prime).toContain(`name: '${tier}'`)
    }
  })

  test('basic listings remain without an official merit tier', () => {
    const brand = read('src/lib/brand.js')
    expect(brand).toContain("meritTier: false")
    expect(brand).toContain("if (assessmentLevel !== 'full' || points == null")
  })
})
