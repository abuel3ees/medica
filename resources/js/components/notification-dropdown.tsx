import { Link } from "@inertiajs/react"
import {
  Activity,
  Bell,
  BellOff,
  Bot,
  Check,
  CheckCheck,
  Info,
  Megaphone,
  Sparkles,
  Zap,
} from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"

interface Notification {
  id: number
  type: string
  title: string
  body: string
  icon: string | null
  priority: string
  read: boolean
  created_at: string
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

export function NotificationDropdown({ unreadCount: initialUnread }: { unreadCount: number }) {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(initialUnread)
  const [loaded, setLoaded] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Sync with server-side prop
  useEffect(() => {
    setUnreadCount(initialUnread)
  }, [initialUnread])

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/notifications", { headers: { Accept: "application/json" } })
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications?.slice(0, 8) ?? [])
        setUnreadCount(data.unread_count ?? 0)
        setLoaded(true)
      }
    } catch { /* ignore */ }
  }, [])

  // Fetch when opened
  useEffect(() => {
    if (open && !loaded) fetchNotifications()
  }, [open, loaded, fetchNotifications])

  // Poll while open
  useEffect(() => {
    if (!open) return
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [open, fetchNotifications])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [open])

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

  return (
    <div ref={ref} className="relative">
      {/* Bell trigger */}
      <button
        onClick={() => { setOpen(!open); if (!loaded) fetchNotifications() }}
        data-tour="notifications"
        className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-0.5 text-[9px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-xl animate-fade-in-up sm:w-96">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
              <p className="text-[11px] text-muted-foreground">
                {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-primary transition-colors hover:bg-primary/10"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {!loaded ? (
              <div className="space-y-1 p-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 animate-pulse rounded-lg bg-muted/30" />
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-10 text-center">
                <BellOff className="mx-auto h-8 w-8 text-muted-foreground/20" />
                <p className="mt-2 text-xs text-muted-foreground">No notifications yet</p>
              </div>
            ) : (
              <div className="p-1.5">
                {notifications.map((notif) => {
                  const Icon = iconMap[notif.icon ?? ""] ?? Bell
                  return (
                    <div
                      key={notif.id}
                      className={`group flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors ${
                        notif.read ? "hover:bg-muted/50" : "bg-primary/5 hover:bg-primary/8"
                      }`}
                    >
                      <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                        notif.read ? "bg-muted" : "bg-primary/10"
                      }`}>
                        <Icon className={`h-3.5 w-3.5 ${notif.read ? "text-muted-foreground" : "text-primary"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-medium leading-snug ${priorityColor[notif.priority] ?? "text-foreground"}`}>
                          {notif.title}
                          {!notif.read && <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-primary" />}
                        </p>
                        <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground line-clamp-2">{notif.body}</p>
                        <p className="mt-0.5 text-[10px] text-muted-foreground/50">{notif.created_at}</p>
                      </div>
                      {!notif.read && (
                        <button
                          onClick={() => markRead(notif.id)}
                          className="mt-1 shrink-0 rounded-md p-1 text-muted-foreground opacity-0 transition-all hover:bg-primary/10 hover:text-primary group-hover:opacity-100"
                          title="Mark as read"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border/50 p-2">
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center rounded-lg py-2 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
