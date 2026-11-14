const fs = require('fs')
const path = require('path')

function read(relative) {
  return fs.readFileSync(path.join(process.cwd(), relative), 'utf8')
}

describe('institutional positioning and public copy contract', () => {
  test('homepage leads with the institution and professional capability, not a geographic market', () => {
    const hero = read('src/components/HeroSlider.jsx')
    const layout = read('src/app/layout.jsx')
    expect(hero).toContain('THE INSTITUTIONAL STANDARD FOR PROFESSIONAL CAPABILITY')
    expect(hero).toContain('professional capability')
    expect(hero).not.toMatch(/Nigerian professionals|Nigeria.s professional capability|African professional talent/i)
    expect(layout).not.toMatch(/African talent marketplace|hire African professionals|Nigeria talent search/i)
    expect(layout).not.toContain("areaServed:{'@type':'Country',name:'Nigeria'}")
  })

  test('About and footer describe Valoria as the institution, not only a marketplace', () => {
    const about = read('src/app/about-us/page.jsx')
    const footer = read('src/components/Footer.jsx')
    expect(about).toContain('Valoria Institute establishes and operates a professional capability framework')
    expect(about).not.toMatch(/African professional talent|African professionals are not underperforming|African in foundation/i)
    expect(footer).toContain('The institution establishing the standards and infrastructure')
  })

  test('programme copy does not claim unawarded certification or fixed follow-up measurement', () => {
    const programmes = read('src/app/programmes/page.jsx')
    const facilitators = read('src/app/facilitators/page.jsx')
    const waitlist = read('src/components/WaitlistForm.jsx')
    expect(programmes).not.toMatch(/certified facilitators|90 days|Cohort-level reporting available/i)
    expect(facilitators).not.toMatch(/PRIME-certified|Valoria-certified|certified facilitator|BROWSE CERTIFIED FACILITATORS/i)
    expect(waitlist).not.toMatch(/PRIME-certified facilitator/i)
    expect(programmes).toContain('confirmed before delivery')
    expect(facilitators).toContain('confirmed before an engagement is agreed')
    expect(facilitators).not.toMatch(/after 90 days|Do not imply PRIME certification/i)
    expect(waitlist).not.toMatch(/every profile is verified|No guesswork\. No gatekeeping/i)
  })

  test('legal and operational jurisdiction remains explicit in legal notices', () => {
    const privacy = read('src/app/privacypolicy/page.jsx')
    const terms = read('src/app/terms-of-use/page.jsx')
    expect(privacy).toContain('registered in Nigeria')
    expect(terms).toContain('laws of the Federal Republic of Nigeria')
  })
})
