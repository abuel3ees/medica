"use client"

import { HelpTip } from "@/components/help-tip"
import { Card, CardContent } from "@/components/ui/card"
import type { StatItem } from "@/types"
import { Clock, Target, TrendingDown, TrendingUp, Users, Zap } from "lucide-react"

const ICON_MAP: Record<string, typeof Target> = {
  "Total Visits": Target,
  "Active Reps": Users,
  "Avg Efficiency": Zap,
  "Avg Visit Time": Clock,
}

const COLOR_MAP: Record<string, string> = {
  "Total Visits": "bg-primary/10",
  "Active Reps": "bg-accent/10",
  "Avg Efficiency": "bg-accent/10",
  "Avg Visit Time": "bg-primary/10",
}

const HELP_MAP: Record<string, string> = {
  "Total Visits": "Number of doctor visits logged in the current period. Trend shows change vs. the prior period.",
  "Active Reps": "Reps who have logged at least one visit in the last 30 days.",
  "Avg Efficiency": "Mean efficiency score (weighted outcome × difficulty ÷ time). Higher is better. 85+ is excellent.",
  "Avg Visit Time": "Average visit duration in minutes. Visits ≤15 min get the best time factor (1.0×).",
}

export function StatsBar({ stats }: { stats: StatItem[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 stagger-children">
      {stats.map((stat) => {
        const Icon = ICON_MAP[stat.label] || Target
        const bgTint = COLOR_MAP[stat.label] || "bg-primary/10"
        return (
          <Card key={stat.label} className="card-hover overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm">
            <CardContent className="relative p-4">
              <div className={`absolute inset-0 ${bgTint} opacity-50`} />
              <div className="relative flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 shadow-sm">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-1">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{stat.label}</p>
                    {HELP_MAP[stat.label] && <HelpTip content={HELP_MAP[stat.label]} side="top" />}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-2xl font-bold tabular-nums text-foreground">{stat.value}</span>
                    <span className={`flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                      stat.up
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-red-500/10 text-red-600 dark:text-red-400"
                    }`}>
                      {stat.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {stat.change}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
