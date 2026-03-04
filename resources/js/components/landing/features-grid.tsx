import { BarChart3, Bot, ClipboardList, Stethoscope, Target, Users } from "lucide-react"

const FEATURES = [
  {
    icon: ClipboardList,
    title: "Simple visit logging",
    description: "Record every doctor interaction in seconds. Pick a doctor, set your goals, note the outcome — done.",
    accent: "bg-primary/10 text-primary",
  },
  {
    icon: Stethoscope,
    title: "Doctor profiles",
    description: "See the full picture for each physician — visit history, preferences, and how the relationship is evolving.",
    accent: "bg-accent/10 text-accent",
  },
  {
    icon: BarChart3,
    title: "Performance scoring",
    description: "Every visit gets a clear score based on goals met and difficulty. Know exactly where you stand.",
    accent: "bg-primary/10 text-primary",
  },
  {
    icon: Users,
    title: "Team dashboard",
    description: "Managers see how every rep is performing — leaderboards, territory maps, and trend charts at a glance.",
    accent: "bg-accent/10 text-accent",
  },
  {
    icon: Bot,
    title: "AI coaching",
    description: "Get personalized tips to improve. Ask questions, spot patterns, and learn from what's working.",
    accent: "bg-primary/10 text-primary",
  },
  {
    icon: Target,
    title: "Objectives tracking",
    description: "Set goals, track progress, and see exactly which objectives are being met across your team.",
    accent: "bg-accent/10 text-accent",
  },
]

export function FeaturesGrid() {
  return (
    <section id="features" className="py-24">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mb-16 text-center animate-fade-in-up">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">Features</p>
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything your team needs
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-muted-foreground">
            From logging a quick visit to reviewing team-wide analytics — Medica covers the whole workflow.
          </p>
        </div>

        <div className="stagger-children grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-border/30 bg-card/80 p-6 backdrop-blur-sm transition-all duration-300 hover:border-border/60 hover:shadow-lg hover:shadow-primary/[0.03]"
            >
              <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${feature.accent} transition-transform duration-300 group-hover:scale-110`}>
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="text-[15px] font-semibold text-foreground">{feature.title}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
