import { DoctorHeatmap } from "@/components/dashboard/doctor-heatmap"
import { RecentVisits } from "@/components/dashboard/recent-visits"
import { RepScoreTable } from "@/components/dashboard/rep-score-table"
import { StatsBar } from "@/components/dashboard/stats-bar"
import { TrendCharts } from "@/components/dashboard/trend-charts"
import type { Auth, DashboardPageProps } from "@/types"
import { Link, usePage } from "@inertiajs/react"
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  Info,
  Lightbulb,
  PlusCircle,
  Sparkles,
  Stethoscope,
} from "lucide-react"

import DashboardLayout from "./layout"

function insightIcon(type: string) {
  if (type === "warning") return <AlertTriangle className="h-4 w-4 text-yellow-500" />
  if (type === "success") return <CheckCircle2 className="h-4 w-4 text-green-500" />
  if (type === "action") return <Lightbulb className="h-4 w-4 text-blue-500" />
  return <Info className="h-4 w-4 text-muted-foreground" />
}

export default function DashboardPage() {
  const page = usePage<{ props: DashboardPageProps & { auth: Auth } }>()
  const { stats, repScores, recentVisits, efficiencyTrend, visitTrend, heatmapData, topDoctors, coachingInsights } =
    page.props as unknown as DashboardPageProps
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
      <div className="flex flex-col gap-6 p-6">
        {/* ───────── Hero Section ───────── */}
        <div className="animate-fade-in-up">
          <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-card p-6 md:p-8">

            <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-col gap-1.5">
                <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                  {greeting}, {firstName}
                  <Sparkles className="ml-2 inline h-5 w-5 text-accent" />
                </h1>
                <p className="max-w-md text-sm text-muted-foreground">
                  {role === "manager"
                    ? "Here's your territory performance at a glance. Drill into any metric below."
                    : "Track your visits, monitor efficiency, and get AI-powered coaching to improve."}
                </p>
              </div>

              {/* Quick actions */}
              <div className="flex items-center gap-2">
                <Link
                  href="/visits/create"
                  className="group inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/25"
                >
                  <PlusCircle className="h-4 w-4" />
                  Log Visit
                  <ArrowRight className="h-3.5 w-3.5 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
                </Link>
                <Link
                  href="/doctors"
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-background/60 px-4 py-2.5 text-sm font-medium text-foreground backdrop-blur-sm transition-all hover:bg-background"
                >
                  <Stethoscope className="h-4 w-4 text-muted-foreground" />
                  Doctors
                </Link>
                <Link
                  href="/visits"
                  className="hidden items-center gap-2 rounded-xl border border-border bg-background/60 px-4 py-2.5 text-sm font-medium text-foreground backdrop-blur-sm transition-all hover:bg-background sm:inline-flex"
                >
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  Visits
                </Link>
              </div>
            </div>

            {/* Live data badge */}
            <div className="absolute right-4 top-4 hidden items-center gap-2 rounded-full bg-background/70 px-3 py-1.5 text-[10px] font-medium text-muted-foreground backdrop-blur-sm md:flex">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              Live
            </div>
          </div>
        </div>

        {/* ───────── Stats ───────── */}
        <div className="animate-fade-in-up" style={{ animationDelay: "80ms" }}>
          <StatsBar stats={stats} />
        </div>

        {/* ───────── AI Coaching Insights ───────── */}
        {coachingInsights && coachingInsights.length > 0 && (
          <div className="animate-fade-in-up" style={{ animationDelay: "160ms" }}>
            <div className="rounded-2xl border border-primary/10 bg-primary/5 p-5">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">AI Coaching Insights</h3>
                    <p className="text-[11px] text-muted-foreground">Personalized tips based on your activity</p>
                  </div>
                </div>
                <Link
                  href="/ai-coach"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Open Coach →
                </Link>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {coachingInsights.map((insight, idx) => (
                  <div
                    key={idx}
                    className="card-hover flex items-start gap-3 rounded-xl border border-border/40 bg-card/70 p-4 backdrop-blur-sm"
                  >
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted/60">
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

        {/* ───────── Charts Row ───────── */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="animate-fade-in-up" style={{ animationDelay: "240ms" }}>
            <TrendCharts efficiencyData={efficiencyTrend} visitData={visitTrend} />
          </div>
          <div className="animate-fade-in-up" style={{ animationDelay: "320ms" }}>
            <DoctorHeatmap heatmapData={heatmapData} topDoctors={topDoctors} />
          </div>
        </div>

        {/* ───────── Tables Row ───────── */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 animate-fade-in-up" style={{ animationDelay: "400ms" }}>
            <RepScoreTable reps={repScores} />
          </div>
          <div className="animate-fade-in-up" style={{ animationDelay: "480ms" }}>
            <RecentVisits visits={recentVisits} />
          </div>
        </div>

        {/* ───────── Help Banner ───────── */}
        <div className="animate-fade-in-up" style={{ animationDelay: "560ms" }}>
          <Link
            href="/help"
            className="group flex items-center gap-4 rounded-2xl border border-border/40 bg-primary/5 p-5 transition-all duration-200 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 transition-transform duration-200 group-hover:scale-110">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">Need help? Check the documentation</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Learn about the efficiency scoring formula, visit workflow, AI coach, and more
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </DashboardLayout>
  )
}
