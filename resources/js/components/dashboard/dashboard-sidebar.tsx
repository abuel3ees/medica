import { cn } from "@/lib/utils"
import { usePermissions } from "@/hooks/use-permissions"
import { Link, usePage } from "@inertiajs/react"
import {
  Activity,
  Bell,
  BookOpen,
  Bot,
  ClipboardPlus,
  LayoutDashboard,
  LogOut,
  Pill,
  Shield,
  Stethoscope,
  Target,
  X,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

type NavEntry = { label: string; href: string; icon: LucideIcon; permission?: string }

const ALL_NAV: NavEntry[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, permission: "view dashboard" },
  { label: "Log Visit", href: "/visits/create", icon: ClipboardPlus, permission: "create visits" },
  { label: "Doctors", href: "/doctors", icon: Stethoscope, permission: "view doctors" },
  { label: "Visits", href: "/visits", icon: Activity, permission: "view visits" },
  { label: "Objectives", href: "/objectives", icon: Target, permission: "view objectives" },
  { label: "Medications", href: "/medications", icon: Pill, permission: "view medications" },
]

interface SidebarProps {
  onClose?: () => void
}

function SidebarContent({ onClose }: SidebarProps) {
  const page = usePage()
  const { url } = page
  const user = page.props.auth.user
  const companyName = (page.props.companyName as string) || "Medica"
  const { can, hasRole } = usePermissions()
  const unreadCount = page.props.unreadNotifications ?? 0

  const navItems = ALL_NAV.filter((item) => !item.permission || can(item.permission)).map((item) => ({
    ...item,
    label: item.href === "/visits" && !can("view all visits") ? "My Visits" : item.label,
  }))

  const roleLabel = hasRole("admin") ? "Admin" : hasRole("manager") ? "Manager" : "Rep"

  const initials = user.name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const handleNav = () => onClose?.()

  return (
    <>
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-border/50 px-5">
        <div className="flex items-center gap-3">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-sm">
            <Activity className="h-4 w-4 text-white" />
            <div className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-accent animate-pulse" />
          </div>
          <div>
            <span className="text-sm font-bold tracking-tight text-foreground">{companyName}</span>
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              {roleLabel} Console
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* User info */}
      <div className="border-b border-border/50 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
            <p className="truncate text-[11px] text-muted-foreground">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3">
        <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
          Navigation
        </p>
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? url === "/dashboard"
              : url.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleNav}
              data-tour={item.href === "/dashboard" ? "dashboard" : item.href === "/visits/create" ? "log-visit" : item.href === "/doctors" ? "doctors" : item.href === "/visits" ? "visits" : item.href === "/objectives" ? "objectives" : item.href === "/medications" ? "medications" : undefined}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-primary shadow-sm"
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
              )}
              <item.icon className={cn("h-4 w-4 transition-transform duration-200 group-hover:scale-110", isActive && "text-primary")} />
              {item.label}
            </Link>
          )
        })}

        <div className="mt-4">
          <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
            Tools
          </p>
          <Link
            href="/ai-coach"
            onClick={handleNav}
            data-tour="ai-coach"
            className={cn(
              "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
              url.startsWith("/ai-coach")
                ? "bg-accent/10 text-accent shadow-sm"
                : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
            )}
          >
            <Bot className={cn("h-4 w-4 transition-transform duration-200 group-hover:scale-110", url.startsWith("/ai-coach") && "text-accent")} />
            AI Coach
            <span className="ml-auto rounded-full bg-accent/15 px-1.5 py-0.5 text-[9px] font-bold uppercase text-accent">
              New
            </span>
          </Link>
          <Link
            href="/help"
            onClick={handleNav}
            data-tour="help"
            className={cn(
              "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
              url.startsWith("/help")
                ? "bg-primary/10 text-primary shadow-sm"
                : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
            )}
          >
            {url.startsWith("/help") && (
              <div className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
            )}
            <BookOpen className={cn("h-4 w-4 transition-transform duration-200 group-hover:scale-110", url.startsWith("/help") && "text-primary")} />
            Help & Docs
          </Link>

          {/* Notifications */}
          <Link
            href="/notifications"
            onClick={handleNav}
            data-tour="notifications"
            className={cn(
              "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
              url.startsWith("/notifications")
                ? "bg-primary/10 text-primary shadow-sm"
                : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
            )}
          >
            <Bell className={cn("h-4 w-4 transition-transform duration-200 group-hover:scale-110", url.startsWith("/notifications") && "text-primary")} />
            Notifications
            {unreadCount > 0 && (
              <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Link>

          {/* Admin Panel */}
          {can("access admin panel") && (
            <Link
              href="/admin"
              onClick={handleNav}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                url.startsWith("/admin")
                  ? "bg-primary/10 text-primary shadow-sm"
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
              )}
            >
              <Shield className={cn("h-4 w-4 transition-transform duration-200 group-hover:scale-110", url.startsWith("/admin") && "text-primary")} />
              Dev Console
              <span className="ml-auto rounded-full bg-primary/15 px-1.5 py-0.5 text-[9px] font-bold uppercase text-primary">
                Admin
              </span>
            </Link>
          )}
        </div>
      </nav>

      {/* Bottom */}
      <div className="flex flex-col gap-0.5 border-t border-border/50 p-3">
        <Link
          href="/logout"
          method="post"
          as="button"
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-muted-foreground transition-all duration-200 hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Link>
      </div>
    </>
  )
}

/** Desktop sidebar — hidden on mobile */
export function DashboardSidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border/50 bg-card/80 backdrop-blur-sm lg:flex">
      <SidebarContent />
    </aside>
  )
}

/** Mobile sidebar drawer */
export function MobileSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
      />
      {/* Drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-card shadow-2xl transition-transform duration-300 ease-in-out lg:hidden",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <SidebarContent onClose={onClose} />
      </aside>
    </>
  )
}
