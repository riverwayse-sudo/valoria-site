import { INSIGHTS } from '@/content/insights'
const SITE_URL='https://valoriainstitute.com'
export function GET(){
  const items=INSIGHTS.map(item=>`<item><title><![CDATA[${item.title}]]></title><link>${SITE_URL}/insights/${item.slug}</link><guid isPermaLink="true">${SITE_URL}/insights/${item.slug}</guid><description><![CDATA[${item.description}]]></description><pubDate>${new Date(item.publishedAt).toUTCString()}</pubDate></item>`).join('')
  const xml=`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Valoria Institute Insights</title><link>${SITE_URL}/insights</link><description>Professional capability, development, visibility, leadership and opportunity.</description>${items}</channel></rss>`
  return new Response(xml,{headers:{'Content-Type':'application/rss+xml; charset=utf-8','Cache-Control':'public, max-age=3600'}})
}