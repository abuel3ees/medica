import { Link, usePage } from "@inertiajs/react"
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  ClipboardPlus,
  Info,
  Lightbulb,
  PlusCircle,
  Sparkles,
  Stethoscope,
  TrendingUp,
  Zap,
} from "lucide-react"

import { DoctorHeatmap } from "@/components/dashboard/doctor-heatmap"
import { RecentVisits } from "@/components/dashboard/recent-visits"
import { RepScoreTable } from "@/components/dashboard/rep-score-table"
import { StatsBar } from "@/components/dashboard/stats-bar"
import { TrendCharts } from "@/components/dashboard/trend-charts"
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

  // Extract highlight stats
  const totalVisits = stats.find((s) => s.label === "Total Visits")
  const avgEfficiency = stats.find((s) => s.label === "Avg Efficiency")

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8">

        {/* ───────── Hero Section — bold gradient card ───────── */}
        <div className="animate-fade-in-up">
          <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-primary/90 via-primary to-primary/80 p-6 text-white shadow-xl shadow-primary/15 md:p-8">
            {/* Decorative elements */}
            <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/5 blur-2xl" />
            <div className="absolute -bottom-8 -left-8 h-36 w-36 rounded-full bg-white/5 blur-2xl" />
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
                backgroundSize: "32px 32px",
              }}
            />

            <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider backdrop-blur-sm">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live Dashboard
                  </span>
                </div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                  {greeting}, {firstName}
                  <Sparkles className="ml-2 inline h-5 w-5 text-white/60" />
                </h1>
                <p className="max-w-lg text-sm text-white/70">
                  {role === "manager"
                    ? "Your territory overview is ready. Dive into performance metrics and coaching insights below."
                    : "Track your progress, review efficiency metrics, and get AI-powered tips to improve."}
                </p>
              </div>

              {/* Quick stat highlights */}
              <div className="flex gap-3 sm:gap-4">
                {totalVisits && (
                  <div className="flex flex-col items-center rounded-xl bg-white/10 px-5 py-3 backdrop-blur-sm">
                    <span className="text-2xl font-bold tabular-nums sm:text-3xl">{totalVisits.value}</span>
                    <span className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-white/60">Visits</span>
                    <span className={`mt-1 flex items-center gap-0.5 text-[10px] font-semibold ${totalVisits.up ? "text-emerald-300" : "text-red-300"}`}>
                      {totalVisits.up ? <TrendingUp className="h-3 w-3" /> : null}
                      {totalVisits.change}
                    </span>
                  </div>
                )}
                {avgEfficiency && (
                  <div className="flex flex-col items-center rounded-xl bg-white/10 px-5 py-3 backdrop-blur-sm">
                    <span className="text-2xl font-bold tabular-nums sm:text-3xl">{avgEfficiency.value}</span>
                    <span className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-white/60">Efficiency</span>
                    <span className={`mt-1 flex items-center gap-0.5 text-[10px] font-semibold ${avgEfficiency.up ? "text-emerald-300" : "text-red-300"}`}>
                      {avgEfficiency.up ? <TrendingUp className="h-3 w-3" /> : null}
                      {avgEfficiency.change}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="relative mt-6 flex flex-wrap items-center gap-2">
              <Link
                href="/visits/create"
                className="group inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-primary shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl"
              >
                <PlusCircle className="h-4 w-4" />
                Log Visit
                <ArrowRight className="h-3.5 w-3.5 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
              </Link>
              <Link
                href="/doctors"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/20"
              >
                <Stethoscope className="h-4 w-4" />
                Doctors
              </Link>
              <Link
                href="/visits"
                className="hidden items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/20 sm:inline-flex"
              >
                <Calendar className="h-4 w-4" />
                Visits
              </Link>
              <Link
                href="/ai-coach"
                className="hidden items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/20 sm:inline-flex"
              >
                <Zap className="h-4 w-4" />
                AI Coach
              </Link>
            </div>
          </div>
        </div>

        {/* ───────── Stats Cards ───────── */}
        <div className="animate-fade-in-up" style={{ animationDelay: "80ms" }}>
          <StatsBar stats={stats} />
        </div>

        {/* ───────── AI Coaching Insights — premium card ───────── */}
        {coachingInsights && coachingInsights.length > 0 && (
          <div className="animate-fade-in-up" style={{ animationDelay: "140ms" }}>
            <div className="relative overflow-hidden rounded-2xl border border-primary/15 bg-linear-to-r from-primary/5 via-transparent to-accent/5 p-5">
              <div className="absolute right-0 top-0 h-32 w-32 bg-linear-to-bl from-primary/5 to-transparent" />
              <div className="relative">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-primary/20 to-accent/20 shadow-sm">
                      <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground">AI Coaching Insights</h3>
                      <p className="text-[11px] text-muted-foreground">Personalized recommendations based on your activity</p>
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
                <div className="grid gap-3 sm:grid-cols-2">
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
          </div>
        )}

        {/* ───────── Charts + Heatmap Row ───────── */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            <TrendCharts efficiencyData={efficiencyTrend} visitData={visitTrend} />
          </div>
          <div className="animate-fade-in-up" style={{ animationDelay: "260ms" }}>
            <DoctorHeatmap heatmapData={heatmapData} topDoctors={topDoctors} />
          </div>
        </div>

        {/* ───────── Leaderboard + Recent Visits + Quick Actions ───────── */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 animate-fade-in-up" style={{ animationDelay: "320ms" }}>
            <RepScoreTable reps={repScores} />
          </div>
          <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: "380ms" }}>
            <RecentVisits visits={recentVisits} />
          </div>
        </div>

        {/* ───────── Quick Links Footer ───────── */}
        <div className="grid gap-4 sm:grid-cols-3 animate-fade-in-up" style={{ animationDelay: "440ms" }}>
          <Link
            href="/visits/create"
            className="group flex items-center gap-3 rounded-xl border border-border/40 bg-card/80 p-4 backdrop-blur-sm transition-all duration-200 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 transition-transform duration-200 group-hover:scale-110">
              <ClipboardPlus className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">Log a Visit</p>
              <p className="text-[11px] text-muted-foreground">Record your latest doctor interaction</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground/40 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
          </Link>
          <Link
            href="/ai-coach"
            className="group flex items-center gap-3 rounded-xl border border-border/40 bg-card/80 p-4 backdrop-blur-sm transition-all duration-200 hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 transition-transform duration-200 group-hover:scale-110">
              <Zap className="h-5 w-5 text-accent" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">AI Coach</p>
              <p className="text-[11px] text-muted-foreground">Get personalized improvement tips</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground/40 transition-transform group-hover:translate-x-1 group-hover:text-accent" />
          </Link>
          <Link
            href="/help"
            className="group flex items-center gap-3 rounded-xl border border-border/40 bg-card/80 p-4 backdrop-blur-sm transition-all duration-200 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 transition-transform duration-200 group-hover:scale-110">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">Help & Docs</p>
              <p className="text-[11px] text-muted-foreground">Learn about scoring & features</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground/40 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
          </Link>
        </div>
      </div>
    </DashboardLayout>
  )
}
