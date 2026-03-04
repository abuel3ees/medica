import { BarChart3, Bot, ClipboardList, Stethoscope, Target, Users } from "lucide-react"

const FEATURES = [
  {
    icon: ClipboardList,
    title: "Visit logging",
    description: "Pick a doctor, check off your objectives, add a note. Takes 30 seconds after every meeting.",
  },
  {
    icon: BarChart3,
    title: "Efficiency scores",
    description: "Each visit gets a score based on what you accomplished vs. what you planned. No guesswork.",
  },
  {
    icon: Stethoscope,
    title: "Doctor profiles",
    description: "Full history for every physician — past visits, what worked, what to try next time.",
  },
  {
    icon: Users,
    title: "Team oversight",
    description: "Managers see every rep's numbers, trends, and territory coverage in one view.",
  },
  {
    icon: Bot,
    title: "AI coach",
    description: "Ask it anything. It knows your data and gives you specific, actionable suggestions.",
  },
  {
    icon: Target,
    title: "Objective tracking",
    description: "Set goals, assign weights, track completion. Know which objectives move the needle.",
  },
]

export function FeaturesGrid() {
  return (
    <section id="features" className="py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        {/* Section header — left-aligned, not centered */}
        <div className="mb-12 max-w-lg">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-primary animate-landing-fade-in">What's inside</p>
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl animate-landing-fade-in [animation-delay:80ms]">
            The tools your field team actually needs
          </h2>
          <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground animate-landing-fade-in [animation-delay:160ms]">
            No bloat. Every feature exists because a real medical rep asked for it.
          </p>
        </div>

        {/* 3-column grid with stagger */}
        <div className="grid gap-px overflow-hidden rounded-xl border border-border/40 bg-border/40 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <div
              key={feature.title}
              className="bg-card p-6 transition-colors duration-200 hover:bg-card/90 animate-landing-fade-in"
              style={{ animationDelay: `${200 + i * 80}ms` }}
            >
              <feature.icon className="mb-3 h-5 w-5 text-primary" />
              <h3 className="text-[14px] font-semibold text-foreground">{feature.title}</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
