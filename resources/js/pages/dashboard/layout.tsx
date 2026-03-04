import { usePage } from "@inertiajs/react"
import { Activity, Menu, Search } from "lucide-react"
import { useState } from "react"
import { CommandPalette } from "@/components/command-palette"
import { DashboardSidebar, MobileSidebar } from "@/components/dashboard/dashboard-sidebar"
import { FloatingAI } from "@/components/floating-ai"
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts"
import { NotificationDropdown } from "@/components/notification-dropdown"
import { OnboardingTutorial } from "@/components/onboarding-tutorial"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [cmdOpen, setCmdOpen] = useState(false)
  const unreadCount = usePage().props.unreadNotifications ?? 0

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex flex-1 flex-col">
        {/* Top header bar — all screen sizes */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border/50 bg-card/80 px-4 backdrop-blur-sm">
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Mobile logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-primary shadow-sm">
              <Activity className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-bold tracking-tight text-foreground">Medica</span>
          </div>

          {/* Command palette trigger bar */}
          <button
            onClick={() => setCmdOpen(true)}
            data-tour="command-palette"
            className="ml-auto flex h-9 flex-1 max-w-md items-center gap-2 rounded-xl border border-border/60 bg-background/60 px-3 text-sm text-muted-foreground backdrop-blur-sm transition-all hover:border-border hover:bg-background lg:ml-0"
          >
            <Search className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">Search commands…</span>
            <span className="sm:hidden">Search…</span>
            <kbd className="ml-auto hidden rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline">
              ⌘K
            </kbd>
          </button>

          {/* Notification dropdown */}
          <NotificationDropdown unreadCount={unreadCount} />
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      <FloatingAI />
      <OnboardingTutorial />
      <CommandPalette externalOpen={cmdOpen} onExternalClose={() => setCmdOpen(false)} />
      <KeyboardShortcuts />
    </div>
  )
}
