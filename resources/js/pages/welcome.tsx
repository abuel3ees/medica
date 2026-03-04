import { CTASection } from "@/components/landing/cta-section"
import { SiteHeader } from "@/components/dashboard/site-header"
import { FeaturesGrid } from "@/components/landing/features-grid"
import { HeroSection } from "@/components/landing/hero-section"
import { Link } from "@inertiajs/react"
import { Activity } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <HeroSection />
        <FeaturesGrid />
        <CTASection />
      </main>
      <footer className="border-t border-border/15 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary">
              <Activity className="h-3 w-3 text-white" />
            </div>
            <span className="text-[13px] font-semibold text-foreground">Medica</span>
          </div>
          <nav className="flex gap-6 text-[12px] text-muted-foreground">
            <Link href="/login" className="hover:text-foreground">Login</Link>
            <Link href="/register" className="hover:text-foreground">Register</Link>
            <Link href="/help" className="hover:text-foreground">Help</Link>
          </nav>
          <p className="text-[11px] text-muted-foreground/40">© 2026 Medica</p>
        </div>
      </footer>
    </div>
  )
}
