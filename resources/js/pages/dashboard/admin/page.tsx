import { usePage } from "@inertiajs/react"
import {
  Activity,
  Bell,
  Building2,
  Check,
  Database,
  Download,
  Eye,
  EyeOff,
  GraduationCap,
  HardDrive,
  Palette,
  Play,
  Plus,
  RefreshCcw,
  Send,
  Server,
  Shield,
  Stethoscope,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Users,
  Zap,
} from "lucide-react"
import { useState } from "react"
import { PRESET_THEMES, PRESET_FONTS, applyTheme, applyDarkOverrides, resetTheme, applyFont, resetFont, getStoredThemeId, getStoredFontId } from "@/lib/themes"
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
  permissions: string[]
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
  companyName: string
  allPermissions: string[]
  allRoles: { name: string; permissions: string[] }[]
  systemInfo: {
    php_version: string
    laravel_version: string
    environment: string
    debug_mode: boolean
    timezone: string
    db_driver: string
    cache_driver: string
    session_driver: string
    server_os: string
    memory_usage: string
    disk_free: string
  }
}

export default function AdminDashboard() {
  const { stats, dbStats, featureFlags: initialFlags, recentActivity, users: initialUsers, companyName: initialCompanyName, systemInfo, allPermissions: initialPermissions, allRoles } = usePage<{ props: Props }>().props as unknown as Props
  const [flags, setFlags] = useState(initialFlags)
  const [users, setUsers] = useState(initialUsers)
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "flags" | "tutorial" | "database" | "notifications" | "activity" | "themes" | "branding" | "system" | "permissions">("overview")
  const [showAddUser, setShowAddUser] = useState(false)
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "rep" })
  const [notifData, setNotifData] = useState({ title: "", body: "", priority: "normal", user_ids: [] as number[] })
  const [showPassword, setShowPassword] = useState(false)
  const [actionFeedback, setActionFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [activeTheme, setActiveTheme] = useState(getStoredThemeId)
  const [activeFont, setActiveFont] = useState(getStoredFontId)
  const [brandName, setBrandName] = useState(initialCompanyName || "Medica")
  const [brandSaving, setBrandSaving] = useState(false)
  const [allPermissions, setAllPermissions] = useState(initialPermissions)
  const [newPermission, setNewPermission] = useState("")
  const [editingUserPerms, setEditingUserPerms] = useState<number | null>(null)
  const [editingPerms, setEditingPerms] = useState<string[]>([])

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

  const saveCompanyName = async () => {
    if (!brandName.trim()) return
    setBrandSaving(true)
    const token = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content
    const res = await fetch("/admin/company-name", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "X-CSRF-TOKEN": token ?? "", "X-Requested-With": "XMLHttpRequest", Accept: "application/json" },
      body: JSON.stringify({ company_name: brandName.trim() }),
    })
    if (res.ok) {
      showFeedback("success", `Company name updated to "${brandName.trim()}"`)
    } else {
      showFeedback("error", "Failed to update company name")
    }
    setBrandSaving(false)
  }

  const [cacheClearing, setCacheClearing] = useState(false)
  const clearCache = async (types: string[]) => {
    setCacheClearing(true)
    const token = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content
    const res = await fetch("/admin/cache/clear", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-CSRF-TOKEN": token ?? "", "X-Requested-With": "XMLHttpRequest", Accept: "application/json" },
      body: JSON.stringify({ types }),
    })
    if (res.ok) {
      const data = await res.json()
      showFeedback("success", `Cleared: ${data.cleared.join(", ")}`)
    } else {
      showFeedback("error", "Failed to clear cache")
    }
    setCacheClearing(false)
  }

  const [exporting, setExporting] = useState(false)
  const exportData = async (tables: string[]) => {
    setExporting(true)
    const token = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content
    const res = await fetch("/admin/export", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-CSRF-TOKEN": token ?? "", "X-Requested-With": "XMLHttpRequest", Accept: "application/json" },
      body: JSON.stringify({ tables }),
    })
    if (res.ok) {
      const data = await res.json()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `export-${new Date().toISOString().split("T")[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      showFeedback("success", "Data exported successfully")
    } else {
      showFeedback("error", "Failed to export data")
    }
    setExporting(false)
  }

  const createPermission = async () => {
    if (!newPermission.trim()) return
    const token = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content
    const res = await fetch("/admin/permissions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-CSRF-TOKEN": token ?? "", "X-Requested-With": "XMLHttpRequest", Accept: "application/json" },
      body: JSON.stringify({ name: newPermission.trim() }),
    })
    if (res.ok) {
      const data = await res.json()
      setAllPermissions((prev) => [...prev, data.permission].sort())
      setNewPermission("")
      showFeedback("success", `Permission "${data.permission}" created`)
    } else {
      const err = await res.json().catch(() => ({}))
      showFeedback("error", err.message || "Failed to create permission")
    }
  }

  const deletePermission = async (name: string) => {
    if (!confirm(`Delete permission "${name}"? Users with this permission will lose it.`)) return
    const token = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content
    const res = await fetch("/admin/permissions", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", "X-CSRF-TOKEN": token ?? "", "X-Requested-With": "XMLHttpRequest", Accept: "application/json" },
      body: JSON.stringify({ name }),
    })
    if (res.ok) {
      setAllPermissions((prev) => prev.filter((p) => p !== name))
      showFeedback("success", `Permission "${name}" deleted`)
    } else {
      showFeedback("error", "Failed to delete permission")
    }
  }

  const saveUserPermissions = async (userId: number) => {
    const token = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content
    const res = await fetch(`/admin/users/${userId}/permissions`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "X-CSRF-TOKEN": token ?? "", "X-Requested-With": "XMLHttpRequest", Accept: "application/json" },
      body: JSON.stringify({ permissions: editingPerms }),
    })
    if (res.ok) {
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, permissions: editingPerms } : u))
      setEditingUserPerms(null)
      setEditingPerms([])
      showFeedback("success", "Permissions updated")
    } else {
      showFeedback("error", "Failed to update permissions")
    }
  }

  const statCards = [
    { label: "Users", value: stats.total_users, icon: Users, accent: "text-primary", sub: `${stats.total_reps} reps · ${stats.total_managers} mgrs` },
    { label: "Visits", value: stats.total_visits, icon: Activity, accent: "text-accent", sub: `${stats.visits_today} today · ${stats.visits_this_week} this week` },
    { label: "Doctors", value: stats.total_doctors, icon: Stethoscope, accent: "text-primary", sub: `${stats.total_objectives} objectives` },
    { label: "Efficiency", value: stats.avg_efficiency, icon: Zap, accent: "text-accent", sub: `${stats.total_medications} medications` },
  ]

  const tabs = [
    { key: "overview", label: "Overview", icon: Activity },
    { key: "users", label: "Users", icon: Users },
    { key: "flags", label: "Flags", icon: ToggleRight },
    { key: "branding", label: "Branding", icon: Building2 },
    { key: "tutorial", label: "Tutorial", icon: GraduationCap },
    { key: "database", label: "Database", icon: Database },
    { key: "notifications", label: "Notify", icon: Bell },
    { key: "activity", label: "Activity", icon: Activity },
    { key: "themes", label: "Themes", icon: Palette },
    { key: "system", label: "System", icon: Server },
    { key: "permissions", label: "Permissions", icon: Shield },
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

        {/* Header — compact, no wasted space */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-foreground">
              <Shield className="h-4.5 w-4.5 text-background" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-foreground">Dev Console</h1>
              <p className="text-[11px] text-muted-foreground">Administration · Monitoring · Config</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/15 px-2.5 py-1 text-[10px] font-medium text-green-600 dark:text-green-400">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            Live
          </span>
        </div>

        {/* Dense stat strip — single row */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {statCards.map((card) => (
            <div key={card.label} className="rounded-xl border border-border/40 bg-card px-3 py-2.5 sm:px-4 sm:py-3">
              <div className="flex items-center gap-2">
                <card.icon className={`h-4 w-4 ${card.accent}`} />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{card.label}</span>
              </div>
              <p className="mt-1 text-xl font-bold tabular-nums text-foreground">{card.value}</p>
              <p className="text-[10px] text-muted-foreground/70">{card.sub}</p>
            </div>
          ))}
        </div>

        {/* Tabs — compact pills */}
        <div className="-mx-4 overflow-x-auto px-4 sm:-mx-6 sm:px-6">
          <div className="inline-flex min-w-full gap-1 rounded-xl border border-border/50 bg-muted/30 p-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
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
          <div className="grid gap-4 animate-fade-in lg:grid-cols-2">
            {/* Left column */}
            <div className="space-y-4">
              {/* Visit activity sparkline area */}
              <div className="rounded-xl border border-border/50 bg-card p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">Visit Activity</h3>
                  <span className="text-[10px] font-medium text-muted-foreground">Last 30 days</span>
                </div>
                <div className="space-y-2.5">
                  {[
                    { label: "Today", value: stats.visits_today, max: Math.max(Number(stats.visits_this_month) || 1, 1) },
                    { label: "This week", value: stats.visits_this_week, max: Math.max(Number(stats.visits_this_month) || 1, 1) },
                    { label: "This month", value: stats.visits_this_month, max: Math.max(Number(stats.visits_this_month) || 1, 1) },
                  ].map((row) => (
                    <div key={row.label}>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{row.label}</span>
                        <span className="font-semibold tabular-nums text-foreground">{row.value}</span>
                      </div>
                      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted/50">
                        <div
                          className="h-full rounded-full bg-primary/70 transition-all duration-500"
                          style={{ width: `${Math.min(100, (Number(row.value) / row.max) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Feature flags quick view */}
              <div className="rounded-xl border border-border/50 bg-card p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">Feature Flags</h3>
                  <button onClick={() => setActiveTab("flags")} className="text-[10px] text-primary hover:underline">Manage →</button>
                </div>
                <div className="space-y-1.5">
                  {flags.map((flag) => (
                    <div key={flag.id} className="flex items-center justify-between rounded-lg px-2 py-1.5 transition-colors hover:bg-muted/30">
                      <span className="text-xs text-muted-foreground">{flag.name}</span>
                      <button
                        onClick={() => toggleFlag(flag)}
                        className={`flex h-5 w-9 items-center rounded-full transition-colors ${flag.enabled ? "bg-green-500" : "bg-muted"}`}
                      >
                        <span className={`h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform ${flag.enabled ? "translate-x-4" : "translate-x-0.5"}`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-4">
              {/* Recent users */}
              <div className="rounded-xl border border-border/50 bg-card p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">Users</h3>
                  <button onClick={() => setActiveTab("users")} className="text-[10px] text-primary hover:underline">All users →</button>
                </div>
                <div className="space-y-1.5">
                  {users.slice(0, 6).map((u) => (
                    <div key={u.id} className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted/30">
                      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                        u.role === "admin" ? "bg-primary/15 text-primary" :
                        u.role === "manager" ? "bg-accent/15 text-accent" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {u.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-foreground">{u.name}</p>
                        <p className="truncate text-[10px] text-muted-foreground">{u.email}</p>
                      </div>
                      <span className="text-[10px] tabular-nums text-muted-foreground">{u.visits_count ?? 0} visits</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent activity */}
              <div className="rounded-xl border border-border/50 bg-card p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">Activity</h3>
                  <button onClick={() => setActiveTab("activity")} className="text-[10px] text-primary hover:underline">Full log →</button>
                </div>
                {recentActivity.length === 0 ? (
                  <p className="py-4 text-center text-xs text-muted-foreground/50">No activity yet</p>
                ) : (
                  <div className="space-y-1.5">
                    {recentActivity.slice(0, 5).map((entry) => (
                      <div key={entry.id} className="flex items-start gap-2 rounded-lg px-2 py-1.5">
                        <div className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/30" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-muted-foreground">
                            <span className="font-medium text-foreground">{entry.user}</span>{" "}
                            {entry.action.replace(/_/g, " ")}
                          </p>
                          <p className="text-[10px] text-muted-foreground/50">{entry.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Database summary */}
              <div className="rounded-xl border border-border/50 bg-card p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">Database</h3>
                  <span className="text-[10px] font-medium tabular-nums text-muted-foreground">{dbStats.size}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {dbStats.tables.slice(0, 6).map((t) => (
                    <div key={t.name} className="rounded-lg bg-muted/30 px-2 py-1.5 text-center">
                      <p className="text-sm font-bold tabular-nums text-foreground">{t.rows}</p>
                      <p className="text-[9px] text-muted-foreground">{t.name}</p>
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

            {/* ── Font selector ── */}
            <div className="pt-2">
              <h2 className="text-base font-semibold text-foreground sm:text-lg">App Font</h2>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">Choose a font for the entire interface. The preview shows how each font looks.</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {PRESET_FONTS.map((font) => {
                const isActive = activeFont === font.id
                return (
                  <button
                    key={font.id}
                    onClick={() => {
                      if (font.id === "inter") {
                        resetFont()
                      } else {
                        applyFont(font)
                      }
                      setActiveFont(font.id)
                      showFeedback("success", `Font changed to ${font.name}`)
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

                    {/* Font name */}
                    <h3 className="text-sm font-semibold text-foreground" style={{ fontFamily: `'${font.family}', ${font.fallback}` }}>{font.name}</h3>

                    {/* Sample text */}
                    <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground" style={{ fontFamily: `'${font.family}', ${font.fallback}` }}>
                      {font.sampleText}
                    </p>

                    {/* Alphabet preview */}
                    <p className="mt-2 text-[11px] tracking-wide text-muted-foreground/60" style={{ fontFamily: `'${font.family}', ${font.fallback}` }}>
                      Aa Bb Cc 0123
                    </p>
                  </button>
                )
              })}
            </div>

            {/* Info */}
            <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
              <p className="text-xs text-muted-foreground">
                <strong className="text-foreground">Note:</strong> Theme and font preferences are stored in your browser. Each user can have their own look. Changes persist across sessions.
              </p>
            </div>
          </div>
        )}

        {/* ────────────────── BRANDING ────────────────── */}
        {activeTab === "branding" && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-base font-semibold text-foreground sm:text-lg">Company Branding</h2>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">Change your company name. This updates the splash screen, sidebar, headers, login page, and all branding across the app.</p>
            </div>

            {/* Company name editor */}
            <div className="rounded-xl border border-border/50 bg-card p-5">
              <h3 className="mb-4 text-sm font-semibold text-foreground">Company Name</h3>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Name</label>
                  <input
                    type="text"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    maxLength={60}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                    placeholder="Your company name"
                  />
                </div>
                <button
                  onClick={saveCompanyName}
                  disabled={brandSaving || !brandName.trim() || brandName.trim() === initialCompanyName}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  {brandSaving ? (
                    <RefreshCcw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Check className="h-3.5 w-3.5" />
                  )}
                  {brandSaving ? "Saving…" : "Save"}
                </button>
              </div>
              <p className="mt-2 text-[10px] text-muted-foreground">Max 60 characters. Refresh the page after saving to see changes everywhere.</p>
            </div>

            {/* Live preview */}
            <div className="rounded-xl border border-border/50 bg-card p-5">
              <h3 className="mb-4 text-sm font-semibold text-foreground">Live Preview</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Sidebar preview */}
                <div className="rounded-lg border border-border/30 bg-muted/20 p-4">
                  <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Sidebar Logo</p>
                  <div className="flex items-center gap-3">
                    <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-sm">
                      <Activity className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <span className="text-sm font-bold tracking-tight text-foreground">{brandName || "Medica"}</span>
                      <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Rep Console</p>
                    </div>
                  </div>
                </div>

                {/* Splash preview */}
                <div className="rounded-lg border border-border/30 p-4" style={{ background: "#1A1510" }}>
                  <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-white/30">Splash Screen</p>
                  <div className="flex items-baseline justify-center py-4">
                    <span style={{ fontFamily: "'DM Serif Display', 'Playfair Display', 'Georgia', serif", fontSize: "40px", color: "#C46A47", lineHeight: 1 }}>
                      {(brandName || "M").charAt(0)}
                    </span>
                    <span style={{ fontFamily: "'DM Serif Display', 'Playfair Display', 'Georgia', serif", fontSize: "40px", color: "#C46A47", lineHeight: 1 }}>
                      {(brandName || "Medica").slice(1)}
                    </span>
                  </div>
                </div>

                {/* Header preview */}
                <div className="rounded-lg border border-border/30 bg-muted/20 p-4">
                  <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Header Bar</p>
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
                      <Activity className="h-3.5 w-3.5 text-white" />
                    </div>
                    <span className="text-sm font-bold text-foreground">{brandName || "Medica"}</span>
                  </div>
                </div>

                {/* Footer preview */}
                <div className="rounded-lg border border-border/30 bg-muted/20 p-4">
                  <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Footer</p>
                  <p className="text-xs text-muted-foreground/60">© 2026 {brandName || "Medica"}</p>
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                onClick={() => {
                  sessionStorage.removeItem("medica_splash_shown")
                  window.location.href = "/"
                }}
                className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-4 text-left transition-all hover:border-primary/30 hover:shadow-sm"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Play className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Replay Splash Screen</p>
                  <p className="text-xs text-muted-foreground">Preview the splash animation with current name</p>
                </div>
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-4 text-left transition-all hover:border-accent/30 hover:shadow-sm"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                  <RefreshCcw className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Reload Page</p>
                  <p className="text-xs text-muted-foreground">Apply branding changes across the app</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* ────────────────── SYSTEM ────────────────── */}
        {activeTab === "system" && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-base font-semibold text-foreground sm:text-lg">System Information</h2>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">Environment details, cache management, and data export tools.</p>
            </div>

            {/* Environment info */}
            <div className="rounded-xl border border-border/50 bg-card p-5">
              <div className="mb-4 flex items-center gap-2">
                <Server className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Environment</h3>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { label: "PHP", value: systemInfo.php_version },
                  { label: "Laravel", value: systemInfo.laravel_version },
                  { label: "Environment", value: systemInfo.environment },
                  { label: "Debug Mode", value: systemInfo.debug_mode ? "On" : "Off" },
                  { label: "Timezone", value: systemInfo.timezone },
                  { label: "Database", value: systemInfo.db_driver },
                  { label: "Cache", value: systemInfo.cache_driver },
                  { label: "Sessions", value: systemInfo.session_driver },
                  { label: "Server OS", value: systemInfo.server_os },
                  { label: "Memory", value: systemInfo.memory_usage },
                  { label: "Disk Free", value: systemInfo.disk_free },
                  { label: "DB Size", value: dbStats.size },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2">
                    <span className="text-xs text-muted-foreground">{item.label}</span>
                    <span className="font-mono text-xs font-medium text-foreground">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cache management */}
            <div className="rounded-xl border border-border/50 bg-card p-5">
              <div className="mb-4 flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-accent" />
                <h3 className="text-sm font-semibold text-foreground">Cache Management</h3>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { label: "App Cache", key: "app", desc: "Flush application cache" },
                  { label: "View Cache", key: "views", desc: "Clear compiled views" },
                  { label: "Route Cache", key: "routes", desc: "Clear route cache" },
                  { label: "Config Cache", key: "config", desc: "Clear config cache" },
                ].map((cache) => (
                  <button
                    key={cache.key}
                    onClick={() => clearCache([cache.key])}
                    disabled={cacheClearing}
                    className="flex flex-col items-start rounded-lg border border-border/40 bg-muted/20 p-3 text-left transition-all hover:border-accent/30 hover:bg-accent/5 disabled:opacity-50"
                  >
                    <p className="text-xs font-medium text-foreground">{cache.label}</p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">{cache.desc}</p>
                  </button>
                ))}
              </div>
              <button
                onClick={() => clearCache(["app", "views", "routes", "config"])}
                disabled={cacheClearing}
                className="mt-3 inline-flex items-center gap-2 rounded-lg bg-accent/10 px-4 py-2 text-xs font-medium text-accent transition-colors hover:bg-accent/20 disabled:opacity-50"
              >
                <RefreshCcw className={`h-3.5 w-3.5 ${cacheClearing ? "animate-spin" : ""}`} />
                Clear All Caches
              </button>
            </div>

            {/* Data export */}
            <div className="rounded-xl border border-border/50 bg-card p-5">
              <div className="mb-4 flex items-center gap-2">
                <Download className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Data Export</h3>
              </div>
              <p className="mb-4 text-xs text-muted-foreground">Download application data as JSON. Useful for backups or analysis.</p>
              <div className="grid gap-2 sm:grid-cols-3">
                <button
                  onClick={() => exportData(["visits", "doctor_profiles", "objectives", "visit_objectives"])}
                  disabled={exporting}
                  className="flex items-center gap-3 rounded-lg border border-border/40 bg-muted/20 p-3 text-left transition-all hover:border-primary/30 hover:bg-primary/5 disabled:opacity-50"
                >
                  <Download className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs font-medium text-foreground">Full Export</p>
                    <p className="text-[10px] text-muted-foreground">Visits, doctors, objectives</p>
                  </div>
                </button>
                <button
                  onClick={() => exportData(["visits"])}
                  disabled={exporting}
                  className="flex items-center gap-3 rounded-lg border border-border/40 bg-muted/20 p-3 text-left transition-all hover:border-primary/30 hover:bg-primary/5 disabled:opacity-50"
                >
                  <Download className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs font-medium text-foreground">Visits Only</p>
                    <p className="text-[10px] text-muted-foreground">All visit records</p>
                  </div>
                </button>
                <button
                  onClick={() => exportData(["users", "doctor_profiles"])}
                  disabled={exporting}
                  className="flex items-center gap-3 rounded-lg border border-border/40 bg-muted/20 p-3 text-left transition-all hover:border-primary/30 hover:bg-primary/5 disabled:opacity-50"
                >
                  <Download className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs font-medium text-foreground">Users & Doctors</p>
                    <p className="text-[10px] text-muted-foreground">User + doctor profiles</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Danger zone */}
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5">
              <h3 className="mb-1 text-sm font-semibold text-destructive">Danger Zone</h3>
              <p className="mb-4 text-xs text-muted-foreground">Destructive actions that cannot be undone. Be careful.</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    if (confirm("This will clear all session storage for you. Continue?")) {
                      sessionStorage.clear()
                      showFeedback("success", "Session storage cleared")
                    }
                  }}
                  className="rounded-lg border border-destructive/30 px-3 py-2 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
                >
                  Clear Session Storage
                </button>
                <button
                  onClick={() => {
                    if (confirm("This will clear all local storage (themes, fonts, preferences). Continue?")) {
                      localStorage.clear()
                      showFeedback("success", "Local storage cleared — refresh to apply")
                    }
                  }}
                  className="rounded-lg border border-destructive/30 px-3 py-2 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
                >
                  Clear Local Storage
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ────────────────── PERMISSIONS ────────────────── */}
        {activeTab === "permissions" && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-base font-semibold text-foreground sm:text-lg">Permission Management</h2>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">Create permissions, manage user access, and review role defaults.</p>
            </div>

            {/* Create new permission */}
            <div className="rounded-xl border border-border/50 bg-card p-5">
              <div className="mb-4 flex items-center gap-2">
                <Plus className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Create Permission</h3>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newPermission}
                  onChange={(e) => setNewPermission(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && createPermission()}
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                  placeholder="e.g. manage reports"
                />
                <button
                  onClick={createPermission}
                  disabled={!newPermission.trim()}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Create
                </button>
              </div>
            </div>

            {/* All permissions list */}
            <div className="rounded-xl border border-border/50 bg-card p-5">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">All Permissions</h3>
                </div>
                <span className="text-[10px] tabular-nums text-muted-foreground">{allPermissions.length} total</span>
              </div>
              <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
                {allPermissions.map((perm) => (
                  <div key={perm} className="flex items-center justify-between rounded-lg border border-border/30 bg-muted/20 px-3 py-2">
                    <span className="text-xs font-medium text-foreground">{perm}</span>
                    <button
                      onClick={() => deletePermission(perm)}
                      className="rounded p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      title={`Delete "${perm}"`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Role defaults (read-only view) */}
            <div className="rounded-xl border border-border/50 bg-card p-5">
              <div className="mb-4 flex items-center gap-2">
                <Users className="h-4 w-4 text-accent" />
                <h3 className="text-sm font-semibold text-foreground">Role Defaults</h3>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {allRoles.map((role) => (
                  <div key={role.name} className="rounded-lg border border-border/30 bg-muted/10 p-3">
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-foreground">{role.name}</p>
                    <div className="space-y-1">
                      {role.permissions.length === 0 ? (
                        <p className="text-[10px] text-muted-foreground/60">No permissions assigned</p>
                      ) : role.permissions.map((p) => (
                        <div key={p} className="flex items-center gap-1.5">
                          <Check className="h-3 w-3 text-green-500" />
                          <span className="text-[11px] text-muted-foreground">{p}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* User permission editor */}
            <div className="rounded-xl border border-border/50 bg-card p-5">
              <div className="mb-4 flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">User Permissions</h3>
              </div>
              <div className="space-y-2">
                {users.map((u) => (
                  <div key={u.id} className="rounded-lg border border-border/30 bg-muted/10 p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                          u.role === "admin" ? "bg-primary/15 text-primary" :
                          u.role === "manager" ? "bg-accent/15 text-accent" :
                          "bg-muted text-muted-foreground"
                        }`}>
                          {u.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-foreground">{u.name}</p>
                          <p className="text-[10px] text-muted-foreground">{u.role} · {u.permissions.length} permissions</p>
                        </div>
                      </div>
                      {editingUserPerms === u.id ? (
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => saveUserPermissions(u.id)}
                            className="rounded-lg bg-primary px-3 py-1.5 text-[11px] font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => { setEditingUserPerms(null); setEditingPerms([]) }}
                            className="rounded-lg border border-border px-3 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted/50"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setEditingUserPerms(u.id); setEditingPerms([...u.permissions]) }}
                          className="rounded-lg border border-border px-3 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                        >
                          Edit
                        </button>
                      )}
                    </div>
                    {editingUserPerms === u.id && (
                      <div className="mt-3 grid gap-1.5 border-t border-border/30 pt-3 sm:grid-cols-2 lg:grid-cols-3">
                        {allPermissions.map((perm) => (
                          <label key={perm} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted/30">
                            <input
                              type="checkbox"
                              checked={editingPerms.includes(perm)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setEditingPerms((prev) => [...prev, perm])
                                } else {
                                  setEditingPerms((prev) => prev.filter((p) => p !== perm))
                                }
                              }}
                              className="h-3.5 w-3.5 rounded border-border text-primary focus:ring-primary/20"
                            />
                            <span className="text-[11px] text-muted-foreground">{perm}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
