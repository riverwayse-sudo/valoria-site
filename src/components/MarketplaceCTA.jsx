import Link from 'next/link'

// Used to open a "which marketplace?" choice popup, back when the site had
// three separate siloed marketplace pages (ATB Connect / Spotlight /
// Develop). Since the marketplace was unified into one filterable listing
// (all three tracks in one place, with tabs), that choice no longer means
// anything — there's only one marketplace to go to. Temitayo flagged the
// popup as a confusing leftover ("that pop up that shows when you click
// marketplace should not be there"). Kept the same name/props so every
// existing call site (Footer, HeroSlider, admin nav, not-found, signup,
// dashboard) keeps working unchanged — just navigates straight to
// /marketplace now instead of opening MarketplaceModal.
export default function MarketplaceCTA({ children, className, style }) {
  return (
    <Link href="/marketplace" className={className} style={style}>
      {children}
    </Link>
  )
}
