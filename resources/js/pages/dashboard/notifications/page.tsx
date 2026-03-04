import {
  Bell,
  BellOff,
  Bot,
  Check,
  CheckCheck,
  Info,
  Megaphone,
  Sparkles,
  Trash2,
  Zap,
  Activity,
} from "lucide-react"
import { useEffect, useState } from "react"
import { usePage } from "@inertiajs/react"
import DashboardLayout from "../layout"

interface Notification {
  id: number
  type: string
  title: string
  body: string
  data: Record<string, unknown> | null
  icon: string | null
  priority: string
  read: boolean
  created_at: string
  created_at_raw: string
}

interface PageProps {
  initialNotifications?: Notification[]
  initialUnreadCount?: number
  [key: string]: unknown
}

const iconMap: Record<string, React.ElementType> = {
  sparkles: Sparkles,
  bot: Bot,
  activity: Activity,
  zap: Zap,
  info: Info,
  megaphone: Megaphone,
  "message-circle": Megaphone,
}

const priorityColor: Record<string, string> = {
  low: "text-muted-foreground",
  normal: "text-foreground",
  high: "text-amber-500",
  urgent: "text-destructive",
}

export default function NotificationsPage() {
  const { initialNotifications, initialUnreadCount } = usePage<PageProps>().props
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications ?? [])
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount ?? 0)
  const [loading, setLoading] = useState(!initialNotifications)
  const [filter, setFilter] = useState<"all" | "unread">("all")

  // Poll for updates every 30 seconds
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      const res = await fetch("/notifications", { headers: { Accept: "application/json" } })
      if (res.ok && !cancelled) {
        const data = await res.json()
        setNotifications(data.notifications)
        setUnreadCount(data.unread_count)
        setLoading(false)
      }
    }

    // If no initial data, fetch immediately; otherwise only poll
    if (!initialNotifications) {
      load()
    }

    const interval = setInterval(load, 30000)
    return () => { cancelled = true; clearInterval(interval) }
  }, [initialNotifications])

  const markRead = async (id: number) => {
    const token = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content
    await fetch(`/notifications/${id}/read`, {
      method: "PATCH",
      headers: { "X-CSRF-TOKEN": token ?? "", Accept: "application/json" },
    })
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }

  const markAllRead = async () => {
    const token = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content
    await fetch("/notifications/read-all", {
      method: "PATCH",
      headers: { "X-CSRF-TOKEN": token ?? "", Accept: "application/json" },
    })
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  const deleteNotification = async (id: number) => {
    const token = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content
    await fetch(`/notifications/${id}`, {
      method: "DELETE",
      headers: { "X-CSRF-TOKEN": token ?? "", Accept: "application/json" },
    })
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const filtered = filter === "unread" ? notifications.filter((n) => !n.read) : notifications

  return (
    <DashboardLayout>
      <div className="flex flex-1 flex-col gap-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Notifications</h1>
            <p className="text-sm text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "All caught up!"}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </button>
          )}
        </div>

        {/* Filter */}
        <div className="flex gap-1 rounded-xl border border-border/50 bg-muted/30 p-1 w-fit">
          <button
            onClick={() => setFilter("all")}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
              filter === "all" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
              filter === "unread" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            Unread {unreadCount > 0 && `(${unreadCount})`}
          </button>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-muted/30" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-border/50 bg-card p-12 text-center">
            <BellOff className="mx-auto h-10 w-10 text-muted-foreground/30" />
            <p className="mt-3 text-sm text-muted-foreground">
              {filter === "unread" ? "No unread notifications" : "No notifications yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((notif) => {
              const Icon = iconMap[notif.icon ?? ""] ?? Bell
              return (
                <div
                  key={notif.id}
                  className={`group flex items-start gap-4 rounded-xl border p-4 transition-all hover:shadow-sm ${
                    notif.read
                      ? "border-border/30 bg-card"
                      : "border-primary/20 bg-primary/3"
                  }`}
                >
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                    notif.read ? "bg-muted" : "bg-primary/10"
                  }`}>
                    <Icon className={`h-4.5 w-4.5 ${notif.read ? "text-muted-foreground" : "text-primary"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className={`text-sm font-medium ${priorityColor[notif.priority] ?? "text-foreground"}`}>
                          {notif.title}
                          {!notif.read && (
                            <span className="ml-2 inline-block h-2 w-2 rounded-full bg-primary" />
                          )}
                        </h3>
                        <p className="mt-0.5 text-sm text-muted-foreground">{notif.body}</p>
                        <p className="mt-1 text-[11px] text-muted-foreground/60">{notif.created_at}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        {!notif.read && (
                          <button
                            onClick={() => markRead(notif.id)}
                            className="rounded-lg p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary"
                            title="Mark as read"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notif.id)}
                          className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
