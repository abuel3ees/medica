import { Button } from "@/components/ui/button"
import { Link, usePage } from "@inertiajs/react"
import { ArrowRight } from "lucide-react"

export function HeroSection() {
  const companyName = (usePage().props.companyName as string) || "Medica"

  return (
    <section className="relative overflow-hidden pb-20 pt-12 md:pb-32 md:pt-20">
      <div className="mx-auto max-w-6xl px-6">
        {/* Two-column asymmetric layout */}
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          {/* Left — copy */}
          <div>
            <div className="mb-5 inline-flex rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-medium text-primary animate-landing-fade-in">
              For pharma field teams
            </div>

            <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1.08] tracking-tight text-foreground animate-landing-fade-in [animation-delay:100ms]">
              Stop guessing.
              <br />
              <span className="text-primary">Start measuring.</span>
            </h1>

            <p className="mt-5 max-w-md text-[15px] leading-[1.7] text-muted-foreground animate-landing-fade-in [animation-delay:200ms]">
              {companyName} gives medical reps one place to log doctor visits, track objectives, and see exactly how they're performing — with scores that actually mean something.
            </p>

            <div className="mt-8 flex items-center gap-3 animate-landing-fade-in [animation-delay:300ms]">
              <Link href="/register">
                <Button className="h-11 rounded-lg bg-foreground px-6 text-background hover:bg-foreground/90">
                  Start free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/#demo-video">
                <Button variant="ghost" className="h-11 px-5 text-muted-foreground">
                  Watch the demo
                </Button>
              </Link>
            </div>

            <div className="mt-8 flex items-center gap-6 text-[12px] text-muted-foreground/70 animate-landing-fade-in [animation-delay:400ms]">
              <span>No credit card</span>
              <span className="h-3 w-px bg-border" />
              <span>Works instantly</span>
              <span className="h-3 w-px bg-border" />
              <span>Free tier available</span>
            </div>
          </div>

          {/* Right — product preview */}
          <div className="relative animate-landing-fade-in [animation-delay:350ms]">
            <div className="overflow-hidden rounded-xl border border-border/40 bg-card shadow-xl">
              {/* Browser chrome */}
              <div className="flex items-center gap-1.5 border-b border-border/30 bg-muted/40 px-3 py-2">
                <div className="h-2 w-2 rounded-full bg-muted-foreground/20" />
                <div className="h-2 w-2 rounded-full bg-muted-foreground/20" />
                <div className="h-2 w-2 rounded-full bg-muted-foreground/20" />
                <div className="ml-3 flex-1 rounded-md bg-background/50 px-4 py-0.5 text-[9px] text-muted-foreground/40">
                  medica.app/dashboard
                </div>
              </div>

              {/* Dashboard mockup */}
              <div className="p-4">
                {/* Top stats row */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "This week", val: "24 visits" },
                    { label: "Avg score", val: "8.4 / 10" },
                    { label: "Doctors", val: "12 active" },
                  ].map((s) => (
                    <div key={s.label} className="rounded-lg border border-border/20 bg-background/60 p-2.5">
                      <p className="text-[9px] text-muted-foreground">{s.label}</p>
                      <p className="mt-0.5 text-sm font-semibold text-foreground">{s.val}</p>
                    </div>
                  ))}
                </div>

                {/* Mini visit list */}
                <div className="mt-3 space-y-1.5">
                  <p className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground/60">Recent visits</p>
                  {[
                    { doc: "Dr. Sarah Chen", score: "9.2", time: "2h ago" },
                    { doc: "Dr. Ahmad Nouri", score: "7.8", time: "Yesterday" },
                    { doc: "Dr. Lisa Park", score: "8.6", time: "2 days ago" },
                  ].map((v) => (
                    <div key={v.doc} className="flex items-center justify-between rounded-md bg-background/40 px-2.5 py-1.5">
                      <div>
                        <p className="text-[11px] font-medium text-foreground">{v.doc}</p>
                        <p className="text-[9px] text-muted-foreground">{v.time}</p>
                      </div>
                      <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">{v.score}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <div className="absolute -bottom-4 -left-4 rounded-lg border border-border/30 bg-card px-3 py-2 shadow-lg animate-landing-float">
              <p className="text-[10px] text-muted-foreground">AI suggestion</p>
              <p className="text-[11px] font-medium text-foreground">"Follow up with Dr. Chen this week"</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
