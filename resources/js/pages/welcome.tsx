import { CTASection } from "@/components/landing/cta-section"
import { FeaturesGrid } from "@/components/landing/features-grid"
import { HeroSection } from "@/components/landing/hero-section"
import { SiteHeader } from "@/components/dashboard/site-header"
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
      <footer className="border-t border-border/20 py-12">
        <div className="mx-auto max-w-5xl px-6">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-primary shadow-sm">
                <Activity className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-[15px] font-bold tracking-tight text-foreground">Medica</span>
            </div>
            <nav className="flex gap-8">
              <Link href="/login" className="text-[13px] text-muted-foreground transition-colors hover:text-foreground">Login</Link>
              <Link href="/register" className="text-[13px] text-muted-foreground transition-colors hover:text-foreground">Register</Link>
              <Link href="/help" className="text-[13px] text-muted-foreground transition-colors hover:text-foreground">Help</Link>
            </nav>
            <p className="text-[11px] text-muted-foreground/50">© 2026 Medica. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
