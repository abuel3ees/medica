import { Button } from "@/components/ui/button"
import { Link } from "@inertiajs/react"
import { ArrowRight, CheckCircle2, Star } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Subtle gradient wash */}
      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-primary/[0.03] via-transparent to-transparent" />

      <div className="mx-auto max-w-5xl px-6 pb-24 pt-20 md:pb-32 md:pt-28">
        <div className="flex flex-col items-center text-center">
          {/* Pill badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-4 py-1.5 animate-fade-in">
            <Star className="h-3.5 w-3.5 text-primary" />
            <span className="text-[12px] font-medium text-primary">Built for medical teams</span>
          </div>

          {/* Headline */}
          <h1 className="max-w-3xl text-balance text-4xl font-bold leading-[1.1] tracking-tight text-foreground animate-fade-in-up sm:text-5xl lg:text-6xl">
            Track visits.
            <br />
            <span className="text-primary">Grow performance.</span>
          </h1>

          {/* Subheadline */}
          <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground animate-fade-in-up" style={{ animationDelay: "80ms" }}>
            Medica helps medical reps and managers log doctor visits, measure what matters, and get smarter with every interaction.
          </p>

          {/* CTA buttons */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row animate-fade-in-up" style={{ animationDelay: "160ms" }}>
            <Link href="/register">
              <Button size="lg" className="gap-2 rounded-xl bg-primary px-8 text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-xl">
                Get started free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/#demo">
              <Button variant="outline" size="lg" className="rounded-xl border-border/50 px-8">
                Try the demo
              </Button>
            </Link>
          </div>

          {/* Trust signals */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px] text-muted-foreground animate-fade-in-up" style={{ animationDelay: "240ms" }}>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-accent" />
              No credit card required
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-accent" />
              Instant setup
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-accent" />
              AI coaching included
            </span>
          </div>

          {/* Preview mockup card */}
          <div className="mt-16 w-full max-w-3xl animate-fade-in-up" style={{ animationDelay: "320ms" }}>
            <div className="overflow-hidden rounded-2xl border border-border/30 bg-card/90 shadow-2xl shadow-primary/5 backdrop-blur-sm">
              {/* Window bar */}
              <div className="flex items-center gap-2 border-b border-border/20 bg-muted/30 px-4 py-2.5">
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-400/60" />
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-400/60" />
                  <div className="h-2.5 w-2.5 rounded-full bg-green-400/60" />
                </div>
                <div className="mx-auto rounded-md bg-background/60 px-12 py-1 text-[10px] text-muted-foreground/50">
                  medica.app/dashboard
                </div>
              </div>
              {/* Preview content */}
              <div className="grid grid-cols-3 gap-3 p-5">
                {[
                  { label: "Visits this week", value: "24", change: "+18%" },
                  { label: "Avg. efficiency", value: "87%", change: "+5%" },
                  { label: "Doctors reached", value: "12", change: "+3" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-xl border border-border/20 bg-background/60 p-3 text-center">
                    <p className="text-[10px] font-medium text-muted-foreground">{stat.label}</p>
                    <p className="mt-1 text-xl font-bold tabular-nums text-foreground">{stat.value}</p>
                    <p className="mt-0.5 text-[10px] font-medium text-accent">{stat.change}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-border/20 px-5 py-3">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                  <span className="text-[10px] text-muted-foreground">Live dashboard preview</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
