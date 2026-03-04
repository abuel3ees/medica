import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bot, ClipboardList, LayoutDashboard, ShieldCheck, UserCircle } from "lucide-react"

const FEATURES = [
  {
    icon: ClipboardList,
    title: "Smart Visit Logging",
    description: "Select a doctor, set objectives, record outcomes, track stance changes. Every visit becomes a scored data point in your intelligence pipeline.",
    details: ["Objectives", "Stance Tracking", "Notes", "Next Steps"],
    color: "text-primary bg-primary/10",
  },
  {
    icon: UserCircle,
    title: "Doctor Profiles",
    description: "Each physician surfaces visit history, an adaptive difficulty rating, segment priority (A/B/C), and a stance-shift timeline.",
    details: ["Full CRUD", "Segments", "Stance History"],
    color: "text-accent bg-accent/10",
  },
  {
    icon: LayoutDashboard,
    title: "Manager Dashboard",
    description: "Rep leaderboard ranked by efficiency, doctor visit heatmap for territory coverage, and trend charts that spot dips early.",
    details: ["Leaderboard", "Heatmap", "Trend Charts"],
    color: "text-chart-3 bg-chart-3/10",
  },
  {
    icon: ShieldCheck,
    title: "Proprietary Scoring",
    description: "Formula: (Objectives × Weight × Difficulty ÷ Time) + Progress Bonus. Accounts for stance shifts, follow-through, and confidence.",
    details: ["5-Factor", "Transparent", "Adaptive"],
    color: "text-chart-4 bg-chart-4/10",
  },
  {
    icon: Bot,
    title: "AI Performance Coach",
    description: "Ask questions, get data-driven answers. The coaching engine analyzes patterns across scores, doctors, time management, and follow-ups.",
    details: ["Chat Interface", "Personalized", "Real-time"],
    color: "text-chart-5 bg-chart-5/10",
  },
]

export function FeaturesGrid() {
  return (
    <section id="features" className="relative border-t border-border/30 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-14 max-w-xl animate-fade-in-up">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">How it works</p>
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Five modules.
            <span className="text-primary"> One intelligence layer.</span>
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Data flows from visit logging through doctor profiles into the scoring engine,
            then surfaces on dashboards with AI coaching. Nothing is siloed.
          </p>
        </div>

        <div className="stagger-children grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, idx) => (
            <Card
              key={feature.title}
              className={`card-hover group overflow-hidden border-border/30 bg-card/80 backdrop-blur-sm ${idx === 4 ? "md:col-span-2 lg:col-span-1" : ""}`}
            >
              <CardHeader className="flex flex-row items-start gap-4 pb-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${feature.color} transition-transform duration-300 group-hover:scale-110`}>
                  <feature.icon className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold text-foreground">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-xs leading-relaxed text-muted-foreground">{feature.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {feature.details.map((detail) => (
                    <span
                      key={detail}
                      className="rounded-full border border-border/30 bg-muted/30 px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground transition-colors group-hover:border-primary/20 group-hover:text-foreground"
                    >
                      {detail}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
