import { CommandPalette } from "@/components/command-palette"
import { FloatingAI } from "@/components/floating-ai"
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts"
import { OnboardingTutorial } from "@/components/onboarding-tutorial"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
      <FloatingAI />
      <OnboardingTutorial />
      <CommandPalette />
      <KeyboardShortcuts />
    </div>
  )
}
