import { Link, usePage } from "@inertiajs/react"
import { Activity, Bell, Menu } from "lucide-react"
import { useState } from "react"
import { CommandPalette } from "@/components/command-palette"
import { DashboardSidebar, MobileSidebar } from "@/components/dashboard/dashboard-sidebar"
import { FloatingAI } from "@/components/floating-ai"
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts"
import { OnboardingTutorial } from "@/components/onboarding-tutorial"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const unreadCount = usePage().props.unreadNotifications ?? 0

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex flex-1 flex-col">
        {/* Mobile header */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border/50 bg-card/80 px-4 backdrop-blur-sm lg:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-primary shadow-sm">
              <Activity className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-bold tracking-tight text-foreground">Medica</span>
          </div>
          <Link
            href="/notifications"
            className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-0.5 text-[9px] font-bold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      <FloatingAI />
      <OnboardingTutorial />
      <CommandPalette />
      <KeyboardShortcuts />
    </div>
  )
}
