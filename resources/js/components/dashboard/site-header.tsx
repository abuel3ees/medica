import { Button } from "@/components/ui/button"
import { Link, usePage } from "@inertiajs/react"
import { Activity, Menu, X } from "lucide-react"
import { useEffect, useState } from "react"

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { props } = usePage<{ auth?: { user?: { id: number } } }>()
  const isLoggedIn = !!(props as { auth?: { user?: { id: number } } })?.auth?.user

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header className={`sticky top-0 z-50 transition-all duration-500 ${scrolled ? "bg-background/90 shadow-sm backdrop-blur-xl" : "bg-transparent"}`}>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
            <Activity className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-bold text-foreground">Medica</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {[
            { label: "Features", href: "/#features" },
            { label: "How it works", href: "/#how" },
            { label: "Demo", href: "/#demo" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-1.5 text-[13px] text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {isLoggedIn ? (
            <Link href="/dashboard">
              <Button size="sm" className="rounded-lg bg-primary text-white hover:bg-primary/90">Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-[13px] text-muted-foreground">Log in</Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="rounded-lg bg-foreground text-background hover:bg-foreground/90">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground md:hidden"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <div className={`overflow-hidden transition-all duration-300 ease-out md:hidden ${mobileOpen ? "max-h-64" : "max-h-0"}`}>
        <div className="border-t border-border/10 bg-background/95 px-6 py-4 backdrop-blur-xl">
          <div className="flex flex-col gap-1">
            <Link href="/#features" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 text-sm text-muted-foreground">Features</Link>
            <Link href="/#how" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 text-sm text-muted-foreground">How it works</Link>
            <Link href="/#demo" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 text-sm text-muted-foreground">Demo</Link>
          </div>
          <div className="mt-3 flex gap-2">
            <Link href="/login" className="flex-1">
              <Button variant="outline" size="sm" className="w-full rounded-lg">Log in</Button>
            </Link>
            <Link href="/register" className="flex-1">
              <Button size="sm" className="w-full rounded-lg bg-foreground text-background">Get Started</Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
