import { Button } from "@/components/ui/button"
import { Link, usePage } from "@inertiajs/react"
import { Activity, Menu, X } from "lucide-react"
import { useState } from "react"

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { props } = usePage<{ auth?: { user?: { id: number } } }>()
  const isLoggedIn = !!(props as { auth?: { user?: { id: number } } })?.auth?.user

  return (
    <header className="sticky top-0 z-50 border-b border-border/30 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-md">
            <Activity className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-bold tracking-tight text-foreground">Medica</span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          <Link href="/#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Features</Link>
          <Link href="/help" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Docs</Link>
          <Link href="/ai-coach" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            AI Coach
          </Link>
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          {isLoggedIn ? (
            <Link href="/dashboard">
              <Button size="sm" className="bg-primary text-white shadow-md hover:bg-primary/90">
                Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">Log in</Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-primary text-white shadow-md hover:bg-primary/90">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground md:hidden"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {mobileOpen && (
        <div className="border-t border-border/30 bg-background/95 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-1 p-4">
            <Link href="/#features" className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-secondary/60">Features</Link>
            <Link href="/help" className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-secondary/60">Help & Docs</Link>
            <Link href="/ai-coach" className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-secondary/60">AI Coach</Link>
            <div className="mt-2 flex gap-2">
              <Link href="/login" className="flex-1">
                <Button variant="outline" size="sm" className="w-full">Log in</Button>
              </Link>
              <Link href="/register" className="flex-1">
                <Button size="sm" className="w-full bg-primary text-white">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
