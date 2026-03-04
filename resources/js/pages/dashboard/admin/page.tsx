import { usePage } from "@inertiajs/react"
import {
  Activity,
  Check,
  Database,
  Eye,
  EyeOff,
  GraduationCap,
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
  X,
} from "lucide-react"
import { useState } from "react"
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
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "flags" | "tutorial" | "database" | "notifications" | "activity">("overview")
  const [showAddUser, setShowAddUser] = useState(false)
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "rep" })
  const [notifData, setNotifData] = useState({ title: "", body: "", priority: "normal", user_ids: [] as number[] })
  const [showPassword, setShowPassword] = useState(false)

  const toggleFlag = async (flag: FeatureFlag) => {
    const token = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content
    const res = await fetch(`/admin/feature-flags/${flag.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "X-CSRF-TOKEN": token ?? "", Accept: "application/json" },
    })
    if (res.ok) {
      const data = await res.json()
      setFlags((prev) => prev.map((f) => (f.id === flag.id ? { ...f, enabled: data.enabled } : f)))
    }
  }

  const addUser = async () => {
    const token = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content
    const res = await fetch("/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-CSRF-TOKEN": token ?? "", Accept: "application/json" },
      body: JSON.stringify(newUser),
    })
    if (res.ok) {
      const data = await res.json()
      setUsers((prev) => [...prev, data.user])
      setNewUser({ name: "", email: "", password: "", role: "rep" })
      setShowAddUser(false)
    }
  }

  const deleteUser = async (userId: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return
    const token = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content
    const res = await fetch(`/admin/users/${userId}`, {
      method: "DELETE",
      headers: { "X-CSRF-TOKEN": token ?? "", Accept: "application/json" },
    })
    if (res.ok) {
      setUsers((prev) => prev.filter((u) => u.id !== userId))
    }
  }

  const sendNotification = async () => {
    const token = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content
    const res = await fetch("/admin/notifications/send", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-CSRF-TOKEN": token ?? "", Accept: "application/json" },
      body: JSON.stringify(notifData),
    })
    if (res.ok) {
      setNotifData({ title: "", body: "", priority: "normal", user_ids: [] })
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
      headers: { "Content-Type": "application/json", "X-CSRF-TOKEN": token ?? "", Accept: "application/json" },
      body: JSON.stringify({ user_ids: userIds }),
    })
    if (res.ok) {
      const data = await res.json()
      setTutorialResult(`Tutorial reset for ${data.reset} user(s). They'll see the onboarding tour on next page load.`)
      setTutorialUserIds([])
      // Update local users state
      setUsers((prev) => prev.map((u) => userIds.includes(u.id) ? { ...u, onboarding_completed: false } : u))
    } else {
      setTutorialResult("Failed to reset onboarding. Please try again.")
    }
    setTutorialLoading(false)
  }

  const statCards = [
    { label: "Total Users", value: stats.total_users, icon: Users, color: "text-primary" },
    { label: "Reps", value: stats.total_reps, icon: User, color: "text-accent" },
    { label: "Managers", value: stats.total_managers, icon: Shield, color: "text-primary" },
    { label: "Total Visits", value: stats.total_visits, icon: Activity, color: "text-accent" },
    { label: "Doctors", value: stats.total_doctors, icon: Stethoscope, color: "text-primary" },
    { label: "Objectives", value: stats.total_objectives, icon: Target, color: "text-accent" },
    { label: "Medications", value: stats.total_medications, icon: Pill, color: "text-primary" },
    { label: "Avg Efficiency", value: stats.avg_efficiency, icon: Activity, color: "text-accent" },
  ]

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "users", label: "Users" },
    { key: "flags", label: "Feature Flags" },
    { key: "tutorial", label: "Tutorial" },
    { key: "database", label: "Database" },
    { key: "notifications", label: "Notifications" },
    { key: "activity", label: "Activity Log" },
  ] as const

  return (
    <DashboardLayout>
      <div className="flex flex-1 flex-col gap-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Dev Console</h1>
            <p className="text-sm text-muted-foreground">System administration, feature flags, user management & monitoring</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/15 px-3 py-1 text-xs font-medium text-green-600 dark:text-green-400">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              System Online
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 rounded-xl border border-border/50 bg-muted/30 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === "overview" && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {statCards.map((card) => (
                <div key={card.label} className="rounded-xl border border-border/50 bg-card p-4 card-hover">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{card.label}</p>
                    <card.icon className={`h-4 w-4 ${card.color}`} />
                  </div>
                  <p className="mt-2 text-2xl font-bold text-foreground">{card.value}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Quick stats */}
              <div className="rounded-xl border border-border/50 bg-card p-5">
                <h3 className="mb-4 text-sm font-semibold text-foreground">Visit Activity</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Today</span>
                    <span className="font-medium text-foreground">{stats.visits_today}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">This week</span>
                    <span className="font-medium text-foreground">{stats.visits_this_week}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">This month</span>
                    <span className="font-medium text-foreground">{stats.visits_this_month}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Unread notifications</span>
                    <span className="font-medium text-foreground">{stats.unread_notifications}</span>
                  </div>
                </div>
              </div>

              {/* Feature flag summary */}
              <div className="rounded-xl border border-border/50 bg-card p-5">
                <h3 className="mb-4 text-sm font-semibold text-foreground">Feature Flags</h3>
                <div className="space-y-2">
                  {flags.slice(0, 5).map((flag) => (
                    <div key={flag.id} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{flag.name}</span>
                      <span className={`font-medium ${flag.enabled ? "text-green-600 dark:text-green-400" : "text-red-500"}`}>
                        {flag.enabled ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users */}
        {activeTab === "users" && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">User Management</h2>
              <button
                onClick={() => setShowAddUser(!showAddUser)}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" />
                Add User
              </button>
            </div>

            {/* Add User Form */}
            {showAddUser && (
              <div className="rounded-xl border border-border bg-card p-5 animate-fade-in-up">
                <h3 className="mb-4 text-sm font-semibold">Create New User</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">Full Name</label>
                    <input
                      type="text"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                      placeholder="John Smith"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">Email</label>
                    <input
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
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
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 pr-10 text-sm outline-none focus:ring-2 focus:ring-primary/30"
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
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      <option value="rep">Rep</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button onClick={addUser} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                    Create User
                  </button>
                  <button onClick={() => setShowAddUser(false)} className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Users Table */}
            <div className="overflow-hidden rounded-xl border border-border/50 bg-card">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/30">
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Visits</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Onboarding</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Joined</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Actions</th>
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
                      <td className="px-4 py-3 text-muted-foreground">{u.visits_count ?? "—"}</td>
                      <td className="px-4 py-3">
                        {u.onboarding_completed
                          ? <Check className="h-4 w-4 text-green-500" />
                          : <X className="h-4 w-4 text-muted-foreground/40" />
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
          </div>
        )}

        {/* Feature Flags */}
        {activeTab === "flags" && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Feature Flags</h2>
              <button
                onClick={() => {
                  sessionStorage.removeItem("medica_splash_shown")
                  window.location.href = "/"
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
              >
                <Play className="h-4 w-4" />
                Replay Splash
              </button>
            </div>
            <div className="space-y-3">
              {flags.map((flag) => (
                <div key={flag.id} className="flex items-center justify-between rounded-xl border border-border/50 bg-card p-4 transition-all hover:shadow-sm">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium text-foreground">{flag.name}</h3>
                      <code className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{flag.key}</code>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{flag.description}</p>
                  </div>
                  <button
                    onClick={() => toggleFlag(flag)}
                    className="ml-4 flex items-center gap-2"
                    title={flag.enabled ? "Click to disable" : "Click to enable"}
                  >
                    {flag.enabled ? (
                      <ToggleRight className="h-8 w-8 text-green-500 transition-colors" />
                    ) : (
                      <ToggleLeft className="h-8 w-8 text-muted-foreground/40 transition-colors" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tutorial Dispatch */}
        {activeTab === "tutorial" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Onboarding Tutorial Control</h2>
                <p className="text-sm text-muted-foreground">Reset or dispatch the guided tutorial for any user</p>
              </div>
            </div>

            {/* Quick actions */}
            <div className="grid gap-4 sm:grid-cols-3">
              <button
                onClick={() => resetOnboarding(users.map((u) => u.id))}
                disabled={tutorialLoading}
                className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-4 text-left transition-all hover:border-primary/30 hover:shadow-sm disabled:opacity-50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <RefreshCcw className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Reset All Users</p>
                  <p className="text-xs text-muted-foreground">Dispatch tutorial to everyone</p>
                </div>
              </button>
              <button
                onClick={() => resetOnboarding(users.filter((u) => u.onboarding_completed).map((u) => u.id))}
                disabled={tutorialLoading}
                className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-4 text-left transition-all hover:border-accent/30 hover:shadow-sm disabled:opacity-50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                  <GraduationCap className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Reset Completed</p>
                  <p className="text-xs text-muted-foreground">Re-trigger for users who finished</p>
                </div>
              </button>
              <button
                onClick={() => resetOnboarding(users.filter((u) => !u.onboarding_completed).map((u) => u.id))}
                disabled={tutorialLoading}
                className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-4 text-left transition-all hover:border-primary/30 hover:shadow-sm disabled:opacity-50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <RefreshCcw className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Reset In-progress</p>
                  <p className="text-xs text-muted-foreground">Restart for users mid-tutorial</p>
                </div>
              </button>
            </div>

            {/* Result banner */}
            {tutorialResult && (
              <div className="rounded-xl border border-accent/30 bg-accent/5 p-4 text-sm text-foreground animate-fade-in">
                {tutorialResult}
              </div>
            )}

            {/* Per-user selection */}
            <div className="rounded-xl border border-border/50 bg-card p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">Select Individual Users</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTutorialUserIds(users.map((u) => u.id))}
                    className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted"
                  >
                    Select All
                  </button>
                  <button
                    onClick={() => setTutorialUserIds([])}
                    className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted"
                  >
                    Clear
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                {users.map((u) => (
                  <label
                    key={u.id}
                    className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-all ${
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
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
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
                <p className="text-xs text-muted-foreground">{tutorialUserIds.length} user(s) selected</p>
                <button
                  onClick={() => resetOnboarding(tutorialUserIds)}
                  disabled={tutorialUserIds.length === 0 || tutorialLoading}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  <RefreshCcw className={`h-4 w-4 ${tutorialLoading ? "animate-spin" : ""}`} />
                  Reset Tutorial
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Database */}
        {activeTab === "database" && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Database Monitor</h2>
              <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-1.5 text-xs">
                <Database className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">SQLite</span>
                <span className="font-medium text-foreground">{dbStats.size}</span>
              </div>
            </div>
            <div className="overflow-hidden rounded-xl border border-border/50 bg-card">
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
                      <td className="px-4 py-2.5 text-right font-mono text-xs text-muted-foreground">{table.rows.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Notifications Sender */}
        {activeTab === "notifications" && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Send Notifications</h2>
            </div>
            <div className="rounded-xl border border-border/50 bg-card p-5">
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Recipients</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setNotifData({ ...notifData, user_ids: users.map((u) => u.id) })}
                      className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted"
                    >
                      Select All
                    </button>
                    <button
                      onClick={() => setNotifData({ ...notifData, user_ids: users.filter((u) => u.role === "rep").map((u) => u.id) })}
                      className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted"
                    >
                      All Reps
                    </button>
                    <button
                      onClick={() => setNotifData({ ...notifData, user_ids: users.filter((u) => u.role === "manager").map((u) => u.id) })}
                      className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted"
                    >
                      All Managers
                    </button>
                    <button
                      onClick={() => setNotifData({ ...notifData, user_ids: [] })}
                      className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted"
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
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {u.name}
                      </button>
                    ))}
                  </div>
                  <p className="mt-1 text-[10px] text-muted-foreground">{notifData.user_ids.length} recipient(s) selected</p>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Title</label>
                  <input
                    type="text"
                    value={notifData.title}
                    onChange={(e) => setNotifData({ ...notifData, title: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="Notification title..."
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Message</label>
                  <textarea
                    value={notifData.body}
                    onChange={(e) => setNotifData({ ...notifData, body: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                    rows={3}
                    placeholder="Write your notification message..."
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Priority</label>
                  <select
                    value={notifData.priority}
                    onChange={(e) => setNotifData({ ...notifData, priority: e.target.value })}
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
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
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  Send Notification
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Activity Log */}
        {activeTab === "activity" && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
            <div className="space-y-2">
              {recentActivity.length === 0 ? (
                <div className="rounded-xl border border-border/50 bg-card p-8 text-center">
                  <Activity className="mx-auto h-8 w-8 text-muted-foreground/30" />
                  <p className="mt-2 text-sm text-muted-foreground">No activity recorded yet.</p>
                </div>
              ) : (
                recentActivity.map((entry) => (
                  <div key={entry.id} className="flex items-start gap-3 rounded-xl border border-border/30 bg-card p-3 transition-colors hover:bg-muted/20">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                      <Activity className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">
                        <span className="font-medium">{entry.user}</span>
                        {" "}
                        <span className="text-muted-foreground">{entry.action.replace(/_/g, " ")}</span>
                        {entry.subject && (
                          <span className="ml-1 font-mono text-xs text-muted-foreground">{entry.subject}</span>
                        )}
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">{entry.time}{entry.ip ? ` · ${entry.ip}` : ""}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
