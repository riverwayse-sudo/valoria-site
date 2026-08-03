import { redirect } from 'next/navigation'

// The live Webflow site (soon to be replaced by this app) links its
// "FIND A FACILITATOR" button to /facilitatormarketplace, which never
// existed in this app — would 404 the moment the domain cuts over.
// See atb-connect/page.jsx for the same consolidation, Facilitator tab.
export default function FacilitatorMarketplaceRedirect() {
  redirect('/marketplace?track=facilitator')
}
