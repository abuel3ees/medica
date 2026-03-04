import { Button } from "@/components/ui/button"
import { Link } from "@inertiajs/react"
import { ArrowRight } from "lucide-react"

const STEPS = [
  { num: "01", title: "Log the visit", desc: "Pick the doctor, check your objectives, add a quick note. Done in under a minute." },
  { num: "02", title: "See your score", desc: "Your efficiency score is calculated based on what you planned vs. what happened." },
  { num: "03", title: "Get smarter", desc: "The AI coach reviews your patterns and tells you specifically what to do differently." },
]

const DEMO_ACCOUNTS = [
  { role: "Manager", email: "manager@medica.test" },
  { role: "Rep — Sam", email: "sam@medica.test" },
  { role: "Rep — Julia", email: "julia@medica.test" },
]

export function CTASection() {
  return (
    <>
      {/* How it works — horizontal numbered steps */}
      <section id="how" className="border-t border-border/15 py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 max-w-lg">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-primary">How it works</p>
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Three steps. That's it.
            </h2>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <div key={s.num} className="animate-landing-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                <span className="text-[32px] font-bold leading-none text-primary/20">{s.num}</span>
                <h3 className="mt-2 text-[14px] font-semibold text-foreground">{s.title}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo section */}
      <section id="demo" className="border-t border-border/15 py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            {/* Left */}
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Don't take our word for it.
                <br />
                <span className="text-muted-foreground">Try the live demo.</span>
              </h2>
              <p className="mt-4 max-w-md text-[14px] leading-relaxed text-muted-foreground">
                Log in with any account below. Browse the dashboard, log a visit, chat with the AI coach. Everything works — it's the real product with sample data.
              </p>
              <div className="mt-6 flex gap-3">
                <Link href="/login">
                  <Button className="h-10 rounded-lg bg-foreground px-5 text-background hover:bg-foreground/90">
                    Open the demo
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/help">
                  <Button variant="ghost" className="h-10 px-5 text-muted-foreground">
                    Read the docs
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right — credential cards */}
            <div className="overflow-hidden rounded-xl border border-border/40 bg-card">
              <div className="border-b border-border/20 px-5 py-3">
                <p className="text-sm font-medium text-foreground">Demo accounts</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  Password for all: <code className="rounded bg-muted px-1 py-0.5 text-[10px] font-semibold text-primary">password</code>
                </p>
              </div>
              <div className="divide-y divide-border/15">
                {DEMO_ACCOUNTS.map((acct) => (
                  <div key={acct.email} className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/30">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-[11px] font-bold text-primary">
                      {acct.role.charAt(0)}
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-foreground">{acct.role}</p>
                      <p className="text-[11px] text-muted-foreground">{acct.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
