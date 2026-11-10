const BRAND = {
  midnight: '#1A1A2E',
  gold: '#C9A84C',
  parchment: '#F7F4EE',
  ivory: '#FAFAF7',
  linen: '#EDE8DC',
  ink: '#25253A',
  muted: '#666678',
  line: '#E8E2D7',
}

const FONT = "Raleway, Arial, Helvetica, sans-serif"
const SITE_URL = 'https://valoriainstitute.com'

export function escapeEmailHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
  }[char]))
}

function safeHref(value) {
  const raw = String(value || '').trim()
  if (!raw) return ''
  if (raw.startsWith('/')) return `${SITE_URL}${raw}`
  try {
    const url = new URL(raw)
    return url.protocol === 'https:' ? url.toString() : ''
  } catch {
    return ''
  }
}

function formatEventDate(start) {
  return new Intl.DateTimeFormat('en-NG', {
    timeZone: 'Africa/Lagos',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(start))
}

function formatEventTime(start) {
  return new Intl.DateTimeFormat('en-NG', {
    timeZone: 'Africa/Lagos',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(start))
}

function button(label, href) {
  const url = safeHref(href)
  if (!url) return ''
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0 8px">
      <tr><td align="center" bgcolor="${BRAND.gold}" style="border-radius:3px">
        <a href="${escapeEmailHtml(url)}" style="display:inline-block;padding:15px 24px;color:${BRAND.midnight};font-family:${FONT};font-size:11px;line-height:1.3;font-weight:800;letter-spacing:1.1px;text-decoration:none;text-transform:uppercase">${escapeEmailHtml(label)} &rarr;</a>
      </td></tr>
    </table>`
}

function imageBlock({ src, alt = '', caption = '', width = 540 }) {
  const url = safeHref(src)
  if (!url) return ''
  const imageWidth = Math.min(Number(width) || 540, 540)
  const safeCaption = caption ? `<p style="margin:8px 0 0;color:#858392;font-family:${FONT};font-size:10px;line-height:1.5">${escapeEmailHtml(caption)}</p>` : ''
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;margin:0 0 22px"><tr><td align="center"><img src="${escapeEmailHtml(url)}" width="${imageWidth}" alt="${escapeEmailHtml(alt)}" border="0" style="display:block;width:100%;max-width:${imageWidth}px;height:auto;border:0;outline:none;text-decoration:none">${safeCaption}</td></tr></table>`
}

function hostPortraitBlock(session) {
  if (session?.host !== 'Temitayo Adetokunbo') return ''
  const src = `${SITE_URL}/images/temitayo-adetokunbo-host.webp`
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px;background:${BRAND.ivory};border:1px solid ${BRAND.line}"><tr><td width="104" valign="middle" style="width:104px;padding:12px"><img src="${src}" width="80" alt="Portrait of Temitayo Adetokunbo, event host" border="0" style="display:block;width:80px;height:auto;border:0"></td><td valign="middle" style="padding:12px 14px 12px 0;font-family:${FONT}"><p style="margin:0 0 5px;color:#92752D;font-size:9px;line-height:1.4;font-weight:800;letter-spacing:1.4px">YOUR HOST</p><p style="margin:0;color:${BRAND.midnight};font-size:14px;line-height:1.4;font-weight:700">Temitayo Adetokunbo</p><p style="margin:4px 0 0;color:${BRAND.muted};font-size:11px;line-height:1.5">Valoria Institute</p></td></tr></table>`
}

function shell({ preheader, eyebrow, heading, content, footer = '', promotional = false }) {
  const unsubscribe = promotional && footer
    ? `<tr><td style="padding:0 30px 26px;background:${BRAND.ivory};font-family:${FONT};font-size:10px;line-height:1.7;color:#858392;text-align:center">${footer}</td></tr>`
    : `<tr><td style="padding:22px 30px 26px;background:${BRAND.ivory};font-family:${FONT};font-size:10px;line-height:1.8;color:#858392">${footer || `Valoria Institute · Worth. Built.<br><a href="${SITE_URL}" style="color:#72591C;text-decoration:underline">valoriainstitute.com</a> &nbsp;·&nbsp; <a href="mailto:info@valoriainstitute.com" style="color:#72591C;text-decoration:underline">Contact the Institute</a>`}</td></tr>`
  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="x-apple-disable-message-reformatting"><title>${escapeEmailHtml(heading)}</title></head>
<body style="margin:0;padding:0;background:${BRAND.parchment};color:${BRAND.ink};font-family:${FONT};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">${escapeEmailHtml(preheader || heading)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;background:${BRAND.parchment}">
    <tr><td align="center" style="padding:28px 12px 36px">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;border:1px solid ${BRAND.line};background:#FFFFFF">
        <tr><td style="height:4px;background:${BRAND.gold};font-size:0;line-height:0">&nbsp;</td></tr>
        <tr><td style="padding:25px 30px 23px;background:${BRAND.midnight}">
          <p style="margin:0;color:${BRAND.gold};font-family:${FONT};font-size:11px;line-height:1.4;font-weight:800;letter-spacing:2.4px">VALORIA INSTITUTE</p>
          <p style="margin:6px 0 0;color:${BRAND.parchment};font-family:${FONT};font-size:11px;line-height:1.5;letter-spacing:.4px">Worth. Built.</p>
        </td></tr>
        <tr><td style="padding:34px 30px 10px">
          <p style="margin:0 0 12px;color:#92752D;font-family:${FONT};font-size:9px;line-height:1.5;font-weight:800;letter-spacing:1.8px;text-transform:uppercase">${escapeEmailHtml(eyebrow || 'VALORIA INSTITUTE')}</p>
          <h1 style="margin:0;color:${BRAND.midnight};font-family:${FONT};font-size:29px;line-height:1.2;font-weight:700;letter-spacing:-.7px">${escapeEmailHtml(heading)}</h1>
        </td></tr>
        <tr><td style="padding:10px 30px 32px;font-family:${FONT};font-size:14px;line-height:1.8;color:${BRAND.muted}">${content}</td></tr>
        ${unsubscribe}
      </table>
      <p style="margin:15px 0 0;color:#9A968D;font-family:${FONT};font-size:9px;line-height:1.6;text-align:center">A more considered way to recognise and build professional worth.</p>
    </td></tr>
  </table>
  <style>@media only screen and (max-width:620px){.email-inner{padding-left:20px!important;padding-right:20px!important}}</style>
</body></html>`
}

export function renderEventRegistrationEmail({ fullName, session, journeyUrl, heroImage }) {
  const firstName = escapeEmailHtml(String(fullName || '').trim().split(/\s+/)[0] || 'there')
  const title = escapeEmailHtml(session.title)
  const date = escapeEmailHtml(formatEventDate(session.start))
  const time = escapeEmailHtml(formatEventTime(session.start))
  const people = [
    session.speaker ? `<tr><td style="padding:10px 0;border-top:1px solid ${BRAND.line};font-size:12px;color:${BRAND.muted}">Guest speaker</td><td align="right" style="padding:10px 0;border-top:1px solid ${BRAND.line};font-size:12px;font-weight:700;color:${BRAND.midnight}">${escapeEmailHtml(session.speaker)}</td></tr>` : '',
    session.host ? `<tr><td style="padding:10px 0;border-top:1px solid ${BRAND.line};font-size:12px;color:${BRAND.muted}">Host</td><td align="right" style="padding:10px 0;border-top:1px solid ${BRAND.line};font-size:12px;font-weight:700;color:${BRAND.midnight}">${escapeEmailHtml(session.host)}</td></tr>` : '',
  ].join('')
  const content = `
    ${heroImage ? imageBlock(heroImage) : ''}
    <p style="margin:0 0 18px;color:${BRAND.midnight}">Hello ${firstName},</p>
    <p style="margin:0 0 22px">Your registration for <strong style="color:${BRAND.midnight}">${title}</strong> has been received and confirmed.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px;border:1px solid ${BRAND.line};background:${BRAND.ivory}">
      <tr><td style="padding:18px 18px 8px">
        <p style="margin:0 0 6px;color:#92752D;font-size:9px;font-weight:800;letter-spacing:1.5px">YOUR EVENT</p>
        <p style="margin:0 0 5px;color:${BRAND.midnight};font-size:16px;line-height:1.45;font-weight:700">${date}</p>
        <p style="margin:0;color:${BRAND.muted};font-size:13px">${time} WAT</p>
      </td></tr>
      <tr><td style="padding:0 18px 12px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${people}</table></td></tr>
    </table>
    ${hostPortraitBlock(session)}
    <p style="margin:0 0 12px">Keep this message for your records. Any essential event updates will be sent to this email address.</p>
    ${button('Continue your Valoria journey', journeyUrl)}
    <p style="margin:16px 0 0;font-size:11px;line-height:1.7;color:#858392">If you did not make this registration, please contact the Institute at <a href="mailto:info@valoriainstitute.com" style="color:#72591C">info@valoriainstitute.com</a>.</p>`
  return {
    subject: `Registration confirmed | ${session.title}`,
    html: shell({ preheader: `Your place is confirmed for ${session.title}.`, eyebrow: 'PROFESSIONAL STANDARD SERIES', heading: 'Your registration is confirmed.', content }),
    text: `Hello ${String(fullName || '').trim().split(/\s+/)[0] || 'there'},\n\nYour registration for ${session.title} has been received and confirmed.\n\nDate: ${formatEventDate(session.start)}\nTime: ${formatEventTime(session.start)} WAT\n${session.speaker ? `Guest speaker: ${session.speaker}\n` : ''}${session.host ? `Host: ${session.host}\n` : ''}\nKeep this message for your records. Any essential event updates will be sent to this email address.\n\nValoria Institute · Worth. Built.\ninfo@valoriainstitute.com`,
  }
}

export function renderEventReminderEmail({ fullName, session, meetingUrl, calendarUrl, reminderLabel = 'A NOTE BEFORE THE CONVERSATION', heroImage }) {
  const firstName = escapeEmailHtml(String(fullName || '').trim().split(/\s+/)[0] || 'there')
  const title = escapeEmailHtml(session.title)
  const date = escapeEmailHtml(formatEventDate(session.start))
  const time = escapeEmailHtml(formatEventTime(session.start))
  const meeting = safeHref(meetingUrl)
  const calendar = safeHref(calendarUrl)
  const content = `
    ${heroImage ? imageBlock(heroImage) : ''}
    <p style="margin:0 0 18px;color:${BRAND.midnight}">Hello ${firstName},</p>
    <p style="margin:0 0 22px">This is a reminder of your registration for <strong style="color:${BRAND.midnight}">${title}</strong>.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 22px;background:${BRAND.ivory};border:1px solid ${BRAND.line}">
      <tr><td style="padding:18px"><p style="margin:0 0 5px;color:#92752D;font-size:9px;font-weight:800;letter-spacing:1.5px">DATE & TIME</p><p style="margin:0;color:${BRAND.midnight};font-size:16px;font-weight:700">${date}</p><p style="margin:4px 0 0;font-size:13px">${time} WAT</p></td></tr>
    </table>
    ${meeting ? button('Join the conversation', meeting) : '<p style="margin:0 0 16px">Access information will be shared separately when it is confirmed.</p>'}
    ${calendar ? `<p style="margin:12px 0 0;font-size:12px"><a href="${escapeEmailHtml(calendar)}" style="color:#72591C">Add this event to your calendar</a></p>` : ''}
    <p style="margin:22px 0 0">We look forward to welcoming you.</p>`
  return {
    subject: `A reminder from Valoria | ${session.title}`,
    html: shell({ preheader: `A reminder about your registered Valoria conversation on ${date}.`, eyebrow: reminderLabel, heading: 'We look forward to seeing you.', content }),
    text: `Hello ${String(fullName || '').trim().split(/\s+/)[0] || 'there'},\n\nA reminder of your registration for ${session.title}.\nDate: ${formatEventDate(session.start)}\nTime: ${formatEventTime(session.start)} WAT\n${meeting ? `Join: ${meeting}\n` : 'Access information will be shared separately when confirmed.\n'}${calendar ? `Add to calendar: ${calendar}\n` : ''}\nValoria Institute · Worth. Built.`,
  }
}

export function renderValoriaCampaignEmail({ preheader, eyebrow, heading, greeting, paragraphs = [], ctaLabel, ctaUrl, unsubscribeUrl, heroImage }) {
  const unsubscribe = safeHref(unsubscribeUrl)
  if (!unsubscribe) throw new Error('A valid unsubscribe URL is required for promotional email.')
  const content = `
    ${heroImage ? imageBlock(heroImage) : ''}
    ${greeting ? `<p style="margin:0 0 18px;color:${BRAND.midnight}">${escapeEmailHtml(greeting)}</p>` : ''}
    ${paragraphs.map(paragraph => `<p style="margin:0 0 17px">${escapeEmailHtml(paragraph)}</p>`).join('')}
    ${button(ctaLabel || 'Explore Valoria', ctaUrl)}`
  const footer = `Valoria Institute · Worth. Built.<br><a href="${SITE_URL}" style="color:#72591C">valoriainstitute.com</a><br><a href="${escapeEmailHtml(unsubscribe)}" style="color:#72591C;text-decoration:underline">Unsubscribe from these emails</a>`
  return {
    subject: heading,
    html: shell({ preheader, eyebrow, heading, content, footer, promotional: true }),
    text: [greeting, ...paragraphs, ctaLabel && safeHref(ctaUrl) ? `${ctaLabel}: ${safeHref(ctaUrl)}` : '', `Unsubscribe: ${unsubscribe}`, 'Valoria Institute · Worth. Built.'].filter(Boolean).join('\n\n'),
  }
}
