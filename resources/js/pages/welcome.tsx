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
      <footer className="border-t border-border/30 bg-card/30 py-10 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary shadow-sm">
                <Activity className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-sm font-bold tracking-tight text-foreground">Medica</span>
            </div>
            <nav className="flex gap-8">
              <Link href="/login" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Login</Link>
              <Link href="/help" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Documentation</Link>
              <Link href="/ai-coach" className="text-sm text-muted-foreground transition-colors hover:text-foreground">AI Coach</Link>
            </nav>
            <p className="text-[10px] text-muted-foreground/60">© 2026 Medica</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
