import { Button } from "@/components/ui/button"
import { Link } from "@inertiajs/react"
import { ArrowRight } from "lucide-react"

const STEPS = [
  { step: "1", title: "Log a visit", desc: "Pick a doctor, set your objectives, record the outcome." },
  { step: "2", title: "Get scored", desc: "Each visit gets an efficiency score automatically." },
  { step: "3", title: "Improve", desc: "AI coaching shows you what to do better next time." },
]

const DEMO_USERS = [
  { role: "Manager", email: "manager@medica.test" },
  { role: "Rep (Sam)", email: "sam@medica.test" },
  { role: "Rep (Julia)", email: "julia@medica.test" },
  { role: "Rep (Priya)", email: "priya@medica.test" },
]

export function CTASection() {
  return (
    <>
      {/* How it works */}
      <section id="how" className="border-t border-border/20 py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-14 text-center animate-fade-in-up">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">How it works</p>
            <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Three simple steps
            </h2>
          </div>
          <div className="stagger-children grid gap-8 sm:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.step} className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-lg font-bold text-primary">
                  {s.step}
                </div>
                <h3 className="text-[15px] font-semibold text-foreground">{s.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo / CTA */}
      <section id="demo" className="border-t border-border/20 py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            {/* Left — CTA */}
            <div className="flex flex-col gap-5 animate-fade-in-up">
              <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                See it in action
              </h2>
              <p className="max-w-md text-[15px] leading-relaxed text-muted-foreground">
                This is a fully working demo. Log in with any account below, explore the dashboard, log a visit, and chat with the AI coach.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/login">
                  <Button size="lg" className="gap-2 rounded-xl bg-primary px-8 text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-xl">
                    Open login
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/help">
                  <Button variant="outline" size="lg" className="rounded-xl border-border/50 px-8">
                    Read the docs
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right — Demo credentials card */}
            <div className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
              <div className="overflow-hidden rounded-2xl border border-border/30 bg-card/90 shadow-xl backdrop-blur-sm">
                <div className="border-b border-border/20 bg-muted/20 px-5 py-3.5">
                  <p className="text-sm font-semibold text-foreground">Demo Accounts</p>
                  <p className="mt-0.5 text-[12px] text-muted-foreground">
                    Password for all: <span className="font-semibold text-primary">password</span>
                  </p>
                </div>
                <div className="divide-y divide-border/15">
                  {DEMO_USERS.map((user) => (
                    <div key={user.email} className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-muted/10">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xs font-bold text-primary">
                        {user.role.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground">{user.role}</p>
                        <p className="text-[12px] text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
