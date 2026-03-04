import { Button } from "@/components/ui/button"
import { Link } from "@inertiajs/react"
import { ArrowRight } from "lucide-react"

const DEMO_USERS = [
  { role: "Manager", email: "manager@medpulse.test", desc: "Full territory overview, rep rankings, all analytics" },
  { role: "Rep (Sam)", email: "sam@medpulse.test", desc: "Individual visit history, personal coaching" },
  { role: "Rep (Julia)", email: "julia@medpulse.test", desc: "Personal dashboard, doctor relationships" },
  { role: "Rep (Priya)", email: "priya@medpulse.test", desc: "Score tracking, AI suggestions" },
]

export function CTASection() {
  return (
    <section className="relative border-t border-border/30 py-20">
      <div className="relative mx-auto max-w-6xl px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          {/* Left — CTA */}
          <div className="flex flex-col gap-6 animate-fade-in-up">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">Try it now</p>
            <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Your team is already visiting doctors.
              <br />
              <span className="text-primary">Start measuring results.</span>
            </h2>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
              This is a fully functional demo. Log in with any account below to explore the dashboard, AI coach, visit logging, and doctor management.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/login">
                <Button size="lg" className="gap-2 bg-primary text-white shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl">
                  Open login
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/help">
                <Button variant="outline" size="lg" className="gap-2 border-border/50 backdrop-blur-sm">
                  Read the docs
                </Button>
              </Link>
            </div>
          </div>

          {/* Right — Demo credentials card */}
          <div className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
            <div className="overflow-hidden rounded-2xl border border-border/40 bg-card/90 shadow-lg backdrop-blur-sm">
              <div className="border-b border-border/30 bg-muted/20 px-5 py-3">
                <p className="text-xs font-semibold text-foreground">🧪 Demo Accounts</p>
                <p className="text-[10px] text-muted-foreground">
                  Password for all: <code className="rounded bg-muted/60 px-1.5 py-0.5 font-mono font-medium text-primary">password</code>
                </p>
              </div>
              <div className="divide-y divide-border/20">
                {DEMO_USERS.map((user) => (
                  <div key={user.email} className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-muted/10">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {user.role.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">{user.role}</p>
                      <p className="truncate text-[11px] text-muted-foreground">{user.email}</p>
                    </div>
                    <p className="hidden text-[10px] text-muted-foreground/70 sm:block max-w-[160px] text-right">{user.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
