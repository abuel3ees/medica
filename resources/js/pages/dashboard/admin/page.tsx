import { usePage } from "@inertiajs/react"
import {
  Activity,
  Bell,
  Check,
  ChevronRight,
  Database,
  Eye,
  EyeOff,
  GraduationCap,
  Palette,
  Pill,
  Play,
  Plus,
  RefreshCcw,
  Send,
  Shield,
  Stethoscope,
  Target,
  ToggleLeft,
  ToggleRight,
  Trash2,
  User,
  Users,
  Zap,
} from "lucide-react"
import { useState } from "react"
import { PRESET_THEMES, applyTheme, applyDarkOverrides, resetTheme, getStoredThemeId } from "@/lib/themes"
import DashboardLayout from "../layout"

interface FeatureFlag {
  id: number
  key: string
  name: string
  description: string | null
  enabled: boolean
}

interface UserRecord {
  id: number
  name: string
  email: string
  role: string
  created_at: string
  visits_count: number | null
  onboarding_completed: boolean
}

interface ActivityLogEntry {
  id: number
  user: string
  action: string
  subject: string | null
  properties: Record<string, unknown> | null
  ip: string | null
  time: string
}

interface Props {
  stats: Record<string, number | string>
  dbStats: { size: string; tables: { name: string; rows: number }[] }
  featureFlags: FeatureFlag[]
  recentActivity: ActivityLogEntry[]
  users: UserRecord[]
}

export default function AdminDashboard() {
  const { stats, dbStats, featureFlags: initialFlags, recentActivity, users: initialUsers } = usePage<{ props: Props }>().props as unknown as Props
  const [flags, setFlags] = useState(initialFlags)
  const [users, setUsers] = useState(initialUsers)
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "flags" | "tutorial" | "database" | "notifications" | "activity" | "themes">("overview")
  const [showAddUser, setShowAddUser] = useState(false)
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "rep" })
  const [notifData, setNotifData] = useState({ title: "", body: "", priority: "normal", user_ids: [] as number[] })
  const [showPassword, setShowPassword] = useState(false)
  const [actionFeedback, setActionFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [activeTheme, setActiveTheme] = useState(getStoredThemeId)

  const showFeedback = (type: "success" | "error", message: string) => {
    setActionFeedback({ type, message })
    setTimeout(() => setActionFeedback(null), 3000)
  }

  const toggleFlag = async (flag: FeatureFlag) => {
    const token = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content
    const res = await fetch(`/admin/feature-flags/${flag.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "X-CSRF-TOKEN": token ?? "", "X-Requested-With": "XMLHttpRequest", Accept: "application/json" },
    })
    if (res.ok) {
      const data = await res.json()
      setFlags((prev) => prev.map((f) => (f.id === flag.id ? { ...f, enabled: data.enabled } : f)))
      showFeedback("success", `${flag.name} ${data.enabled ? "enabled" : "disabled"}`)
    }
  }

  const addUser = async () => {
    const token = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content
    const res = await fetch("/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-CSRF-TOKEN": token ?? "", "X-Requested-With": "XMLHttpRequest", Accept: "application/json" },
      body: JSON.stringify(newUser),
    })
    if (res.ok) {
      const data = await res.json()
      setUsers((prev) => [...prev, data.user])
      setNewUser({ name: "", email: "", password: "", role: "rep" })
      setShowAddUser(false)
      showFeedback("success", "User created successfully")
    } else {
      showFeedback("error", "Failed to create user")
    }
  }

  const deleteUser = async (userId: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return
    const token = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content
    const res = await fetch(`/admin/users/${userId}`, {
      method: "DELETE",
      headers: { "X-CSRF-TOKEN": token ?? "", "X-Requested-With": "XMLHttpRequest", Accept: "application/json" },
    })
    if (res.ok) {
      setUsers((prev) => prev.filter((u) => u.id !== userId))
      showFeedback("success", "User deleted")
    }
  }

  const sendNotification = async () => {
    const token = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content
    const res = await fetch("/admin/notifications/send", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-CSRF-TOKEN": token ?? "", "X-Requested-With": "XMLHttpRequest", Accept: "application/json" },
      body: JSON.stringify(notifData),
    })
    if (res.ok) {
      setNotifData({ title: "", body: "", priority: "normal", user_ids: [] })
      showFeedback("success", "Notification sent!")
    } else {
      showFeedback("error", "Failed to send notification")
    }
  }

  const [tutorialUserIds, setTutorialUserIds] = useState<number[]>([])
  const [tutorialLoading, setTutorialLoading] = useState(false)
  const [tutorialResult, setTutorialResult] = useState<string | null>(null)

  const resetOnboarding = async (userIds: number[]) => {
    if (userIds.length === 0) return
    setTutorialLoading(true)
    setTutorialResult(null)
    const token = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content
    const res = await fetch("/admin/onboarding/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-CSRF-TOKEN": token ?? "", "X-Requested-With": "XMLHttpRequest", Accept: "application/json" },
      body: JSON.stringify({ user_ids: userIds }),
    })
    if (res.ok) {
      const data = await res.json()
      setTutorialResult(`Tutorial reset for ${data.reset} user(s).`)
      setTutorialUserIds([])
      setUsers((prev) => prev.map((u) => userIds.includes(u.id) ? { ...u, onboarding_completed: false } : u))
    } else {
      setTutorialResult("Failed to reset onboarding.")
    }
    setTutorialLoading(false)
  }

  const statCards = [
    { label: "Total Users", value: stats.total_users, icon: Users, accent: "bg-primary/10 text-primary" },
    { label: "Reps", value: stats.total_reps, icon: User, accent: "bg-accent/10 text-accent" },
    { label: "Managers", value: stats.total_managers, icon: Shield, accent: "bg-primary/10 text-primary" },
    { label: "Total Visits", value: stats.total_visits, icon: Activity, accent: "bg-accent/10 text-accent" },
    { label: "Doctors", value: stats.total_doctors, icon: Stethoscope, accent: "bg-primary/10 text-primary" },
    { label: "Objectives", value: stats.total_objectives, icon: Target, accent: "bg-accent/10 text-accent" },
    { label: "Medications", value: stats.total_medications, icon: Pill, accent: "bg-primary/10 text-primary" },
    { label: "Avg Efficiency", value: stats.avg_efficiency, icon: Zap, accent: "bg-accent/10 text-accent" },
  ]

  const tabs = [
    { key: "overview", label: "Overview", icon: Activity },
    { key: "users", label: "Users", icon: Users },
    { key: "flags", label: "Flags", icon: ToggleRight },
    { key: "tutorial", label: "Tutorial", icon: GraduationCap },
    { key: "database", label: "Database", icon: Database },
    { key: "notifications", label: "Notify", icon: Bell },
    { key: "activity", label: "Activity", icon: Activity },
    { key: "themes", label: "Themes", icon: Palette },
  ] as const

  return (
    <DashboardLayout>
      <div className="flex flex-1 flex-col gap-4 p-4 sm:gap-6 sm:p-6">
        {/* Feedback toast */}
        {actionFeedback && (
          <div className={`fixed right-4 top-4 z-50 animate-fade-in-up rounded-xl border px-4 py-3 text-sm font-medium shadow-lg sm:right-6 sm:top-6 ${
            actionFeedback.type === "success"
              ? "border-accent/30 bg-accent/10 text-accent"
              : "border-destructive/30 bg-destructive/10 text-destructive"
          }`}>
            {actionFeedback.message}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">Dev Console</h1>
            <p className="text-xs text-muted-foreground sm:text-sm">System administration & monitoring</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/15 px-3 py-1 text-xs font-medium text-green-600 dark:text-green-400">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              Online
            </span>
          </div>
        </div>

        {/* Tabs — horizontally scrollable on mobile */}
        <div className="-mx-4 overflow-x-auto px-4 sm:-mx-6 sm:px-6">
          <div className="inline-flex min-w-full gap-1 rounded-xl border border-border/50 bg-muted/30 p-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all sm:text-sm ${
                  activeTab === tab.key
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon className="h-3.5 w-3.5" />
                <span className="hidden xs:inline sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ────────────────── OVERVIEW ────────────────── */}
        {activeTab === "overview" && (
          <div className="space-y-6 animate-fade-in">
            {/* Stat cards */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4">
              {statCards.map((card) => (
                <div key={card.label} className="group rounded-xl border border-border/50 bg-card p-3 transition-all hover:border-border hover:shadow-sm sm:p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground sm:text-xs">{card.label}</p>
                    <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${card.accent} sm:h-8 sm:w-8`}>
                      <card.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </div>
                  </div>
                  <p className="mt-1.5 text-xl font-bold text-foreground sm:mt-2 sm:text-2xl">{card.value}</p>
                </div>
              ))}
            </div>

            {/* Quick stats + Feature flag summary */}
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
              <div className="rounded-xl border border-border/50 bg-card p-4 sm:p-5">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                    <Activity className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">Visit Activity</h3>
                </div>
                <div className="space-y-3">
                  {[
                    { label: "Today", value: stats.visits_today },
                    { label: "This week", value: stats.visits_this_week },
                    { label: "This month", value: stats.visits_this_month },
                    { label: "Unread notifications", value: stats.unread_notifications },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{row.label}</span>
                      <span className="font-semibold tabular-nums text-foreground">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-border/50 bg-card p-4 sm:p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10">
                      <ToggleRight className="h-3.5 w-3.5 text-accent" />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground">Feature Flags</h3>
                  </div>
                  <button onClick={() => setActiveTab("flags")} className="text-xs text-muted-foreground transition-colors hover:text-foreground">
                    View all <ChevronRight className="inline h-3 w-3" />
                  </button>
                </div>
                <div className="space-y-2.5">
                  {flags.slice(0, 5).map((flag) => (
                    <div key={flag.id} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{flag.name}</span>
                      <span className={`inline-flex items-center gap-1 text-xs font-medium ${flag.enabled ? "text-green-600 dark:text-green-400" : "text-red-500"}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${flag.enabled ? "bg-green-500" : "bg-red-500"}`} />
                        {flag.enabled ? "On" : "Off"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ────────────────── USERS ────────────────── */}
        {activeTab === "users" && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground sm:text-lg">User Management</h2>
              <button
                onClick={() => setShowAddUser(!showAddUser)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:gap-2 sm:px-4 sm:text-sm"
              >
                <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Add User</span>
                <span className="sm:hidden">Add</span>
              </button>
            </div>

            {/* Add User Form */}
            {showAddUser && (
              <div className="rounded-xl border border-primary/20 bg-card p-4 shadow-sm animate-fade-in-up sm:p-5">
                <h3 className="mb-4 text-sm font-semibold text-foreground">Create New User</h3>
                <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">Full Name</label>
                    <input
                      type="text"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                      placeholder="John Smith"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">Email</label>
                    <input
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                      placeholder="john@medica.test"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 pr-10 text-sm outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                        placeholder="Min 8 characters"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">Role</label>
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="rep">Rep</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button onClick={addUser} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                    Create
                  </button>
                  <button onClick={() => setShowAddUser(false)} className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Users — Card layout on mobile, table on desktop */}
            <div className="hidden overflow-hidden rounded-xl border border-border/50 bg-card md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/30">
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Visits</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Tutorial</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Joined</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground"></th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-border/30 transition-colors hover:bg-muted/20">
                      <td className="px-4 py-3 font-medium text-foreground">{u.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          u.role === "admin" ? "bg-primary/15 text-primary" :
                          u.role === "manager" ? "bg-accent/15 text-accent" :
                          "bg-muted text-muted-foreground"
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 tabular-nums text-muted-foreground">{u.visits_count ?? "—"}</td>
                      <td className="px-4 py-3">
                        {u.onboarding_completed
                          ? <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400"><Check className="h-3.5 w-3.5" /> Done</span>
                          : <span className="text-xs text-muted-foreground/50">Pending</span>
                        }
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{u.created_at}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => deleteUser(u.id)} className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile user cards */}
            <div className="space-y-2 md:hidden">
              {users.map((u) => (
                <div key={u.id} className="rounded-xl border border-border/50 bg-card p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ${
                        u.role === "admin" ? "bg-primary/15 text-primary" :
                        u.role === "manager" ? "bg-accent/15 text-accent" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {u.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{u.name}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                    <button onClick={() => deleteUser(u.id)} className="rounded-lg p-1.5 text-muted-foreground/40 transition-colors hover:bg-destructive/10 hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-2 flex items-center gap-3 text-xs">
                    <span className={`inline-flex rounded-full px-2 py-0.5 font-medium ${
                      u.role === "admin" ? "bg-primary/15 text-primary" :
                      u.role === "manager" ? "bg-accent/15 text-accent" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {u.role}
                    </span>
                    <span className="text-muted-foreground">{u.visits_count ?? 0} visits</span>
                    <span className={u.onboarding_completed ? "text-green-600 dark:text-green-400" : "text-muted-foreground/50"}>
                      {u.onboarding_completed ? "✓ Tutorial done" : "Pending"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ────────────────── FEATURE FLAGS ────────────────── */}
        {activeTab === "flags" && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-base font-semibold text-foreground sm:text-lg">Feature Flags</h2>
              <button
                onClick={() => {
                  sessionStorage.removeItem("medica_splash_shown")
                  window.location.href = "/"
                }}
                className="inline-flex items-center gap-2 self-start rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-xs font-medium text-primary transition-colors hover:bg-primary/10 sm:px-4 sm:text-sm"
              >
                <Play className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Replay Splash
              </button>
            </div>
            <div className="space-y-2.5">
              {flags.map((flag) => (
                <div key={flag.id} className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-3 transition-all hover:border-border hover:shadow-sm sm:gap-4 sm:p-4">
                  <button
                    onClick={() => toggleFlag(flag)}
                    className="shrink-0"
                    title={flag.enabled ? "Click to disable" : "Click to enable"}
                  >
                    {flag.enabled ? (
                      <ToggleRight className="h-7 w-7 text-green-500 transition-colors sm:h-8 sm:w-8" />
                    ) : (
                      <ToggleLeft className="h-7 w-7 text-muted-foreground/40 transition-colors sm:h-8 sm:w-8" />
                    )}
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <h3 className="text-sm font-medium text-foreground">{flag.name}</h3>
                      <code className="hidden rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground sm:inline">{flag.key}</code>
                    </div>
                    {flag.description && (
                      <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{flag.description}</p>
                    )}
                  </div>
                  <span className={`shrink-0 text-xs font-medium ${flag.enabled ? "text-green-600 dark:text-green-400" : "text-muted-foreground/50"}`}>
                    {flag.enabled ? "On" : "Off"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ────────────────── TUTORIAL ────────────────── */}
        {activeTab === "tutorial" && (
          <div className="space-y-4 animate-fade-in sm:space-y-6">
            <div>
              <h2 className="text-base font-semibold text-foreground sm:text-lg">Onboarding Tutorial</h2>
              <p className="text-xs text-muted-foreground sm:text-sm">Reset or dispatch the guided tutorial</p>
            </div>

            {/* Quick actions */}
            <div className="grid gap-3 sm:grid-cols-3">
              <button
                onClick={() => resetOnboarding(users.map((u) => u.id))}
                disabled={tutorialLoading}
                className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-3 text-left transition-all hover:border-primary/30 hover:shadow-sm disabled:opacity-50 sm:p-4"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 sm:h-10 sm:w-10">
                  <RefreshCcw className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Reset All</p>
                  <p className="text-xs text-muted-foreground">All users</p>
                </div>
              </button>
              <button
                onClick={() => resetOnboarding(users.filter((u) => u.onboarding_completed).map((u) => u.id))}
                disabled={tutorialLoading}
                className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-3 text-left transition-all hover:border-accent/30 hover:shadow-sm disabled:opacity-50 sm:p-4"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 sm:h-10 sm:w-10">
                  <GraduationCap className="h-4 w-4 text-accent sm:h-5 sm:w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Reset Completed</p>
                  <p className="text-xs text-muted-foreground">Finished users only</p>
                </div>
              </button>
              <button
                onClick={() => resetOnboarding(users.filter((u) => !u.onboarding_completed).map((u) => u.id))}
                disabled={tutorialLoading}
                className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-3 text-left transition-all hover:border-primary/30 hover:shadow-sm disabled:opacity-50 sm:p-4"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted sm:h-10 sm:w-10">
                  <RefreshCcw className="h-4 w-4 text-muted-foreground sm:h-5 sm:w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Reset In-progress</p>
                  <p className="text-xs text-muted-foreground">Mid-tutorial users</p>
                </div>
              </button>
            </div>

            {tutorialResult && (
              <div className="rounded-xl border border-accent/30 bg-accent/5 p-3 text-sm text-foreground animate-fade-in sm:p-4">
                {tutorialResult}
              </div>
            )}

            {/* Per-user selection */}
            <div className="rounded-xl border border-border/50 bg-card p-4 sm:p-5">
              <div className="mb-3 flex flex-col gap-2 sm:mb-4 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-sm font-semibold text-foreground">Select Individual Users</h3>
                <div className="flex gap-2">
                  <button onClick={() => setTutorialUserIds(users.map((u) => u.id))} className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium hover:bg-muted">
                    Select All
                  </button>
                  <button onClick={() => setTutorialUserIds([])} className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted">
                    Clear
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                {users.map((u) => (
                  <label
                    key={u.id}
                    className={`flex cursor-pointer items-center justify-between rounded-lg border p-2.5 transition-all sm:p-3 ${
                      tutorialUserIds.includes(u.id)
                        ? "border-primary/40 bg-primary/5"
                        : "border-border/30 hover:border-border"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={tutorialUserIds.includes(u.id)}
                        onChange={() =>
                          setTutorialUserIds((prev) =>
                            prev.includes(u.id) ? prev.filter((id) => id !== u.id) : [...prev, u.id]
                          )
                        }
                        className="h-4 w-4 rounded border-border accent-primary"
                      />
                      <div>
                        <p className="text-sm font-medium text-foreground">{u.name}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className={`hidden rounded-full px-2 py-0.5 text-xs font-medium sm:inline-flex ${
                        u.role === "admin" ? "bg-primary/15 text-primary" :
                        u.role === "manager" ? "bg-accent/15 text-accent" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {u.role}
                      </span>
                      <span className={`inline-flex items-center gap-1 text-xs ${u.onboarding_completed ? "text-green-600 dark:text-green-400" : "text-amber-500"}`}>
                        {u.onboarding_completed ? <><Check className="h-3.5 w-3.5" /> Done</> : "Pending"}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{tutorialUserIds.length} selected</p>
                <button
                  onClick={() => resetOnboarding(tutorialUserIds)}
                  disabled={tutorialUserIds.length === 0 || tutorialLoading}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 sm:px-4 sm:text-sm"
                >
                  <RefreshCcw className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${tutorialLoading ? "animate-spin" : ""}`} />
                  Reset Tutorial
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ────────────────── DATABASE ────────────────── */}
        {activeTab === "database" && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-base font-semibold text-foreground sm:text-lg">Database Monitor</h2>
              <div className="flex items-center gap-2 self-start rounded-lg bg-muted/50 px-3 py-1.5 text-xs">
                <Database className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="font-medium text-foreground">{dbStats.size}</span>
              </div>
            </div>

            {/* Table on desktop, cards on mobile */}
            <div className="hidden overflow-hidden rounded-xl border border-border/50 bg-card sm:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/30">
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Table</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Rows</th>
                  </tr>
                </thead>
                <tbody>
                  {dbStats.tables.map((table) => (
                    <tr key={table.name} className="border-b border-border/30 transition-colors hover:bg-muted/20">
                      <td className="px-4 py-2.5 font-mono text-xs text-foreground">{table.name}</td>
                      <td className="px-4 py-2.5 text-right font-mono text-xs tabular-nums text-muted-foreground">{table.rows.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="grid grid-cols-2 gap-2 sm:hidden">
              {dbStats.tables.map((table) => (
                <div key={table.name} className="rounded-lg border border-border/50 bg-card p-3">
                  <p className="font-mono text-[11px] text-muted-foreground">{table.name}</p>
                  <p className="mt-0.5 text-lg font-bold tabular-nums text-foreground">{table.rows.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ────────────────── NOTIFICATIONS ────────────────── */}
        {activeTab === "notifications" && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-base font-semibold text-foreground sm:text-lg">Send Notifications</h2>
            <div className="rounded-xl border border-border/50 bg-card p-4 sm:p-5">
              <div className="space-y-4">
                {/* Recipients */}
                <div>
                  <label className="mb-2 block text-xs font-medium text-muted-foreground">Recipients</label>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    <button
                      onClick={() => setNotifData({ ...notifData, user_ids: users.map((u) => u.id) })}
                      className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium hover:bg-muted"
                    >
                      All
                    </button>
                    <button
                      onClick={() => setNotifData({ ...notifData, user_ids: users.filter((u) => u.role === "rep").map((u) => u.id) })}
                      className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium hover:bg-muted"
                    >
                      Reps
                    </button>
                    <button
                      onClick={() => setNotifData({ ...notifData, user_ids: users.filter((u) => u.role === "manager").map((u) => u.id) })}
                      className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium hover:bg-muted"
                    >
                      Managers
                    </button>
                    <button
                      onClick={() => setNotifData({ ...notifData, user_ids: [] })}
                      className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {users.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          setNotifData((prev) => ({
                            ...prev,
                            user_ids: prev.user_ids.includes(u.id)
                              ? prev.user_ids.filter((id) => id !== u.id)
                              : [...prev.user_ids, u.id],
                          }))
                        }}
                        className={`rounded-full px-2.5 py-1 text-xs font-medium transition-all ${
                          notifData.user_ids.includes(u.id)
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {u.name.split(" ")[0]}
                      </button>
                    ))}
                  </div>
                  <p className="mt-1.5 text-[10px] text-muted-foreground">{notifData.user_ids.length} recipient(s)</p>
                </div>

                {/* Title & Message */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Title</label>
                  <input
                    type="text"
                    value={notifData.title}
                    onChange={(e) => setNotifData({ ...notifData, title: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                    placeholder="Notification title..."
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Message</label>
                  <textarea
                    value={notifData.body}
                    onChange={(e) => setNotifData({ ...notifData, body: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                    rows={3}
                    placeholder="Write your message..."
                  />
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">Priority</label>
                    <select
                      value={notifData.priority}
                      onChange={(e) => setNotifData({ ...notifData, priority: e.target.value })}
                      className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <button
                    onClick={sendNotification}
                    disabled={!notifData.title || !notifData.body || notifData.user_ids.length === 0}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ────────────────── ACTIVITY LOG ────────────────── */}
        {activeTab === "activity" && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-base font-semibold text-foreground sm:text-lg">Recent Activity</h2>
            {recentActivity.length === 0 ? (
              <div className="rounded-xl border border-border/50 bg-card p-8 text-center">
                <Activity className="mx-auto h-8 w-8 text-muted-foreground/30" />
                <p className="mt-2 text-sm text-muted-foreground">No activity recorded yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentActivity.map((entry) => (
                  <div key={entry.id} className="flex items-start gap-3 rounded-xl border border-border/30 bg-card p-3 transition-colors hover:bg-muted/20">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                      <Activity className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-foreground">
                        <span className="font-medium">{entry.user}</span>
                        {" "}
                        <span className="text-muted-foreground">{entry.action.replace(/_/g, " ")}</span>
                        {entry.subject && (
                          <span className="ml-1 hidden font-mono text-xs text-muted-foreground sm:inline">{entry.subject}</span>
                        )}
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">{entry.time}{entry.ip ? ` · ${entry.ip}` : ""}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ────────────────── THEMES ────────────────── */}
        {activeTab === "themes" && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-base font-semibold text-foreground sm:text-lg">App Theme</h2>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">Choose a color theme for the entire application. Changes apply instantly.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {PRESET_THEMES.map((theme) => {
                const isActive = activeTheme === theme.id
                return (
                  <button
                    key={theme.id}
                    onClick={() => {
                      if (theme.id === "terracotta") {
                        resetTheme()
                      } else {
                        applyTheme(theme)
                        applyDarkOverrides(theme)
                      }
                      setActiveTheme(theme.id)
                      showFeedback("success", `Theme changed to ${theme.name}`)
                    }}
                    className={`group relative rounded-xl border p-4 text-left transition-all hover:shadow-md ${
                      isActive
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-border/50 bg-card hover:border-border"
                    }`}
                  >
                    {/* Active badge */}
                    {isActive && (
                      <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}

                    {/* Color preview */}
                    <div className="mb-3 flex items-center gap-2">
                      <div className="flex -space-x-1">
                        <div className="h-8 w-8 rounded-full border-2 border-white shadow-sm" style={{ background: theme.preview.primary }} />
                        <div className="h-8 w-8 rounded-full border-2 border-white shadow-sm" style={{ background: theme.preview.accent }} />
                        <div className="h-8 w-8 rounded-full border-2 border-white shadow-sm" style={{ background: theme.preview.bg }} />
                      </div>
                    </div>

                    {/* Theme info */}
                    <h3 className="text-sm font-semibold text-foreground">{theme.name}</h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">{theme.description}</p>

                    {/* Mini preview bar */}
                    <div className="mt-3 flex gap-1.5">
                      <div className="h-1.5 flex-1 rounded-full" style={{ background: theme.preview.primary }} />
                      <div className="h-1.5 w-8 rounded-full" style={{ background: theme.preview.accent }} />
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Info */}
            <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
              <p className="text-xs text-muted-foreground">
                <strong className="text-foreground">Note:</strong> Theme preference is stored in your browser. Each user can have their own theme. The selected theme persists across sessions.
              </p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
