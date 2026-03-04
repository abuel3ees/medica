import { Link, usePage } from "@inertiajs/react"
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Info,
  Lightbulb,
  PlusCircle,
  Sparkles,
  Stethoscope,
  Zap,
} from "lucide-react"

import { DoctorHeatmap } from "@/components/dashboard/doctor-heatmap"
import { GoalProgress } from "@/components/dashboard/goal-progress"
import { OutcomeChart } from "@/components/dashboard/outcome-chart"
import { RecentVisits } from "@/components/dashboard/recent-visits"
import { RepScoreTable } from "@/components/dashboard/rep-score-table"
import { StatsBar } from "@/components/dashboard/stats-bar"
import { TrendCharts } from "@/components/dashboard/trend-charts"
import { VisitBarChart } from "@/components/dashboard/visit-bar-chart"
import type { Auth, DashboardPageProps } from "@/types"

import DashboardLayout from "./layout"

function insightIcon(type: string) {
  if (type === "warning") return <AlertTriangle className="h-4 w-4 text-yellow-500" />
  if (type === "success") return <CheckCircle2 className="h-4 w-4 text-green-500" />
  if (type === "action") return <Lightbulb className="h-4 w-4 text-blue-500" />
  return <Info className="h-4 w-4 text-muted-foreground" />
}

export default function DashboardPage() {
  const page = usePage<{ props: DashboardPageProps & { auth: Auth } }>()
  const {
    stats,
    repScores,
    recentVisits,
    efficiencyTrend,
    visitTrend,
    heatmapData,
    topDoctors,
    coachingInsights,
    outcomeDistribution,
    dailyVisits,
    goalProgress,
  } = page.props as unknown as DashboardPageProps
  const user = (page.props as unknown as { auth: Auth }).auth.user
  const role = (user as { role?: string }).role ?? "rep"

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return "Good morning"
    if (h < 17) return "Good afternoon"
    return "Good evening"
  })()

  const firstName = user?.name?.split(" ")[0] ?? "there"

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-5 p-4 sm:p-6 lg:p-8">

        {/* ───────── Compact Header ───────── */}
        <div className="animate-fade-in-up flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-primary/80 shadow-lg shadow-primary/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                {greeting}, {firstName}
              </h1>
              <p className="text-xs text-muted-foreground">
                {role === "manager"
                  ? "Territory overview — performance metrics & team insights"
                  : "Your progress dashboard — efficiency, visits & AI coaching"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/visits/create"
              className="group inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-md shadow-primary/20 transition-all hover:scale-[1.02] hover:shadow-lg"
            >
              <PlusCircle className="h-4 w-4" />
              Log Visit
              <ArrowRight className="h-3.5 w-3.5 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
            </Link>
            <Link
              href="/doctors"
              className="inline-flex items-center gap-2 rounded-xl border border-border/50 bg-card/80 px-4 py-2 text-sm font-medium text-foreground backdrop-blur-sm transition-all hover:bg-muted/50"
            >
              <Stethoscope className="h-4 w-4" />
              Doctors
            </Link>
            <Link
              href="/ai-coach"
              className="hidden items-center gap-2 rounded-xl border border-border/50 bg-card/80 px-4 py-2 text-sm font-medium text-foreground backdrop-blur-sm transition-all hover:bg-muted/50 sm:inline-flex"
            >
              <Zap className="h-4 w-4" />
              AI Coach
            </Link>
          </div>
        </div>

        {/* ───────── Stats Cards ───────── */}
        <div className="animate-fade-in-up" style={{ animationDelay: "60ms" }}>
          <StatsBar stats={stats} />
        </div>

        {/* ───────── Weekly Goals (circular gauges) ───────── */}
        <div className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <GoalProgress data={goalProgress} />
        </div>

        {/* ───────── Main Charts Row — 3 columns ───────── */}
        <div className="grid gap-5 lg:grid-cols-3">
          {/* Efficiency trend — takes 1 col */}
          <div className="animate-fade-in-up" style={{ animationDelay: "140ms" }}>
            <TrendCharts efficiencyData={efficiencyTrend} visitData={visitTrend} />
          </div>
          {/* Daily bar chart — takes 1 col */}
          <div className="animate-fade-in-up" style={{ animationDelay: "180ms" }}>
            <VisitBarChart data={dailyVisits} />
          </div>
          {/* Outcome donut — takes 1 col */}
          <div className="animate-fade-in-up" style={{ animationDelay: "220ms" }}>
            <OutcomeChart data={outcomeDistribution} />
          </div>
        </div>

        {/* ───────── Heatmap + AI Coaching Insights ───────── */}
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="animate-fade-in-up" style={{ animationDelay: "260ms" }}>
            <DoctorHeatmap heatmapData={heatmapData} topDoctors={topDoctors} />
          </div>

          {/* AI Coaching Insights */}
          {coachingInsights && coachingInsights.length > 0 && (
            <div className="animate-fade-in-up" style={{ animationDelay: "300ms" }}>
              <div className="h-full overflow-hidden rounded-xl border border-primary/15 bg-linear-to-br from-primary/5 via-transparent to-accent/5 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-linear-to-br from-primary/20 to-accent/20 shadow-sm">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground">AI Coaching Insights</h3>
                      <p className="text-[10px] text-muted-foreground">Personalized recommendations</p>
                    </div>
                  </div>
                  <Link
                    href="/ai-coach"
                    className="group flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-all hover:bg-primary/20"
                  >
                    Open Coach
                    <ArrowUpRight className="h-3 w-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </Link>
                </div>
                <div className="flex flex-col gap-3">
                  {coachingInsights.map((insight, idx) => (
                    <div
                      key={idx}
                      className="card-hover flex items-start gap-3 rounded-xl border border-border/40 bg-card/80 p-4 backdrop-blur-sm"
                    >
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/60">
                        {insightIcon(insight.type)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">{insight.title}</p>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{insight.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ───────── Leaderboard + Recent Visits ───────── */}
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2 animate-fade-in-up" style={{ animationDelay: "340ms" }}>
            <RepScoreTable reps={repScores} />
          </div>
          <div className="animate-fade-in-up" style={{ animationDelay: "380ms" }}>
            <RecentVisits visits={recentVisits} />
          </div>
        </div>

      </div>
    </DashboardLayout>
  )
}
