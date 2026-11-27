const fs = require('fs')
const path = require('path')

function read(relative) {
  return fs.readFileSync(path.join(process.cwd(), relative), 'utf8')
}

function orderedIndices(source, marker, titles) {
  const start = source.indexOf(marker)
  return titles.map(title => source.indexOf(`<h3>${title}</h3>`, start))
}

describe('approved five-stage VALU participant journey', () => {
  test('the VALU overview page presents account, Taster, confirmation, dashboard and full assessment in order', () => {
    const page = read('src/app/valu/page.jsx')
    const titles = [
      'Create your account',
      'Complete your guided Taster',
      'Confirm your email',
      'Open your dashboard',
      'Continue to the full VALU Index',
    ]
    const indices = orderedIndices(page, 'className="valu-steps"', titles)
    expect(indices).toHaveLength(5)
    expect(indices.every((value, index) => value >= 0 && (index === 0 || value > indices[index - 1]))).toBe(true)
    const steps = page.slice(page.indexOf('className="valu-steps"'), page.indexOf('</section>', page.indexOf('className="valu-steps"')))
    expect((steps.match(/<article>/g) || [])).toHaveLength(5)
    expect(page).not.toMatch(/\b1 of (?:9|58)\b/)
  })

  test('the VALU start page uses the same five-stage sequence and does not put confirmation before the Taster', () => {
    const page = read('src/app/valu/start/page.jsx')
    const titles = [
      'Create your account',
      'Complete your Taster',
      'Confirm your email',
      'Open your dashboard',
      'Continue to the full VALU Index',
    ]
    const indices = orderedIndices(page, 'className="vs-journey-grid"', titles)
    expect(indices).toHaveLength(5)
    expect(indices.every((value, index) => value >= 0 && (index === 0 || value > indices[index - 1]))).toBe(true)
    const steps = page.slice(page.indexOf('className="vs-journey-grid"'), page.indexOf('</section>', page.indexOf('className="vs-journey-grid"')))
    expect((steps.match(/<article>/g) || [])).toHaveLength(5)
  })

  test('five-step public journey cards use a balanced responsive grid', () => {
    const styles = read('src/app/pages.css')
    expect(styles).toContain('.valu-steps{display:grid;grid-template-columns:repeat(3,1fr);')
    expect(styles).toContain('.vs-journey-grid{display:grid;grid-template-columns:repeat(3,1fr);')
    expect(styles).toContain('.valu-steps{grid-template-columns:1fr 1fr}')
    expect(styles).toContain('.vs-journey-grid{grid-template-columns:1fr 1fr}')
  })
})
