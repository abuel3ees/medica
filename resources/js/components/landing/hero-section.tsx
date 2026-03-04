import { Button } from "@/components/ui/button"
import { Link } from "@inertiajs/react"
import { Activity, ArrowRight, BarChart3, Bot, CheckCircle2, Clock, Shield, Zap } from "lucide-react"

const METRICS = [
  { label: "Visits Scored", value: "12,400+", icon: Activity },
  { label: "Avg Response", value: "<2s", icon: Clock },
  { label: "Score Accuracy", value: "99.7%", icon: Shield },
]

const DEMO_CREDS = [
  { role: "Manager", email: "manager@medpulse.test" },
  { role: "Rep", email: "sam@medpulse.test" },
]

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="mx-auto max-w-6xl px-6 pb-20 pt-16 md:pb-28 md:pt-24">
        <div className="flex flex-col gap-20 lg:flex-row lg:items-start lg:gap-16">
          {/* Left — copy */}
          <div className="flex flex-1 flex-col gap-7 animate-fade-in-up">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-semibold text-primary">
                <Zap className="h-3 w-3" />
                AI-Powered Visit Intelligence
              </span>
            </div>

            <h1 className="text-balance text-4xl font-bold leading-[1.1] tracking-tight text-foreground md:text-5xl lg:text-[56px]">
              Know which reps
              <br />
              <span className="text-primary">deliver results.</span>
            </h1>

            <p className="max-w-md text-base leading-relaxed text-muted-foreground">
              Medica scores every doctor visit by objectives met, access difficulty,
              and time efficiency. AI coaching turns weak spots into wins.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/login">
                <Button size="lg" className="gap-2 bg-primary text-white shadow-lg transition-all hover:bg-primary/90">
                  Try the demo
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="#features">
                <Button variant="outline" size="lg" className="gap-2 border-border/50 backdrop-blur-sm hover:bg-secondary/60">
                  See how it works
                </Button>
              </Link>
            </div>

            {/* Demo credentials inline */}
            <div className="flex items-center gap-4 rounded-lg border border-border/40 bg-card/60 px-4 py-3 backdrop-blur-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-[11px] font-semibold text-foreground">Demo Mode Active</p>
                <p className="text-[10px] text-muted-foreground">
                  {DEMO_CREDS.map((c, i) => (
                    <span key={c.email}>
                      {i > 0 && " · "}
                      <span className="font-medium text-foreground">{c.role}:</span> {c.email}
                    </span>
                  ))}
                  {" · pw: "}
                  <code className="rounded bg-muted px-1 font-mono text-[10px]">password</code>
                </p>
              </div>
            </div>
          </div>

          {/* Right — visual card */}
          <div className="flex flex-1 flex-col gap-4 animate-fade-in-up" style={{ animationDelay: "150ms" }}>
            {/* Score preview card */}
            <div className="overflow-hidden rounded-2xl border border-border/40 bg-card/90 shadow-xl backdrop-blur-sm">
              <div className="flex items-center justify-between border-b border-border/30 px-5 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
                    <BarChart3 className="h-3.5 w-3.5 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-foreground">Live Efficiency Scores</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                  <span className="text-[9px] font-medium text-accent">LIVE</span>
                </div>
              </div>
              <div className="divide-y divide-border/20 p-0">
                {[
                  { rep: "Sam K.", doctor: "Dr. Reeves · Cardiology", score: 94, change: "+5", stance: "Supportive" },
                  { rep: "Julia M.", doctor: "Dr. Nakata · Oncology", score: 87, change: "+12", stance: "Neutral → Supportive" },
                  { rep: "Priya D.", doctor: "Dr. Osman · Neurology", score: 72, change: "-3", stance: "Neutral" },
                ].map((row, i) => (
                  <div key={i} className="flex items-center gap-4 px-5 py-3.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                      {row.rep.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">{row.rep}</p>
                      <p className="truncate text-[10px] text-muted-foreground">{row.doctor}</p>
                    </div>
                    <div className="text-right">
                      <span className={`font-mono text-lg font-bold tabular-nums ${row.score >= 85 ? "text-accent" : row.score >= 70 ? "text-foreground" : "text-destructive"}`}>
                        {row.score}
                      </span>
                      <p className={`text-[10px] font-medium ${row.change.startsWith("+") ? "text-accent" : "text-destructive"}`}>
                        {row.change}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-border/30 bg-muted/20 px-5 py-2.5">
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>3 visits scored today</span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-accent" />
                    AI coaching active
                  </span>
                </div>
              </div>
            </div>

            {/* Metrics strip */}
            <div className="grid grid-cols-3 gap-3">
              {METRICS.map((m) => (
                <div key={m.label} className="card-hover flex flex-col items-center gap-1.5 rounded-xl border border-border/30 bg-card/80 py-3 backdrop-blur-sm">
                  <m.icon className="h-4 w-4 text-primary/70" />
                  <span className="font-mono text-base font-bold tabular-nums text-foreground">{m.value}</span>
                  <span className="text-[9px] text-muted-foreground">{m.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
