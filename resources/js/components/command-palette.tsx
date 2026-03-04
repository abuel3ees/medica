import { router } from "@inertiajs/react"
import {
  Activity,
  Bot,
  ClipboardPlus,
  LayoutDashboard,
  Moon,
  Pill,
  Search,
  Settings,
  Shield,
  Stethoscope,
  Sun,
  Target,
  Bell,
  BookOpen,
} from "lucide-react"
import { useEffect, useRef, useState } from "react"

interface CommandItem {
  id: string
  label: string
  description?: string
  icon: React.ElementType
  action: () => void
  category: string
  keywords?: string[]
}

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const commands: CommandItem[] = [
    { id: "dashboard", label: "Go to Dashboard", icon: LayoutDashboard, action: () => router.visit("/dashboard"), category: "Navigation", keywords: ["home", "overview"] },
    { id: "visits", label: "View Visits", icon: Activity, action: () => router.visit("/visits"), category: "Navigation", keywords: ["log", "history"] },
    { id: "create-visit", label: "Log New Visit", icon: ClipboardPlus, action: () => router.visit("/visits/create"), category: "Navigation", keywords: ["new", "add", "create"] },
    { id: "doctors", label: "View Doctors", icon: Stethoscope, action: () => router.visit("/doctors"), category: "Navigation", keywords: ["physician", "hcp"] },
    { id: "objectives", label: "View Objectives", icon: Target, action: () => router.visit("/objectives"), category: "Navigation", keywords: ["goals", "targets"] },
    { id: "medications", label: "View Medications", icon: Pill, action: () => router.visit("/medications"), category: "Navigation", keywords: ["drugs", "pdf"] },
    { id: "ai-coach", label: "Open AI Coach", icon: Bot, action: () => router.visit("/ai-coach"), category: "Tools", keywords: ["chat", "assistant", "help"] },
    { id: "notifications", label: "View Notifications", icon: Bell, action: () => router.visit("/notifications"), category: "Tools", keywords: ["alerts", "inbox"] },
    { id: "help", label: "Help & Documentation", icon: BookOpen, action: () => router.visit("/help"), category: "Tools", keywords: ["docs", "guide"] },
    { id: "settings", label: "Settings", icon: Settings, action: () => router.visit("/settings/profile"), category: "Tools", keywords: ["profile", "account"] },
    { id: "admin", label: "Dev Console", icon: Shield, action: () => router.visit("/admin"), category: "Tools", keywords: ["admin", "flags", "users"] },
    {
      id: "dark-mode",
      label: "Toggle Dark Mode",
      icon: Moon,
      action: () => {
        const html = document.documentElement
        html.classList.toggle("dark")
        const isDark = html.classList.contains("dark")
        localStorage.setItem("appearance", isDark ? "dark" : "light")
      },
      category: "Theme",
      keywords: ["light", "theme", "appearance"],
    },
    {
      id: "light-mode",
      label: "Toggle Light Mode",
      icon: Sun,
      action: () => {
        const html = document.documentElement
        html.classList.toggle("dark")
        const isDark = html.classList.contains("dark")
        localStorage.setItem("appearance", isDark ? "dark" : "light")
      },
      category: "Theme",
      keywords: ["dark", "theme", "appearance"],
    },
  ]

  const filtered = query
    ? commands.filter((cmd) => {
        const q = query.toLowerCase()
        return (
          cmd.label.toLowerCase().includes(q) ||
          cmd.description?.toLowerCase().includes(q) ||
          cmd.keywords?.some((k) => k.includes(q)) ||
          cmd.category.toLowerCase().includes(q)
        )
      })
    : commands

  // Group by category
  const grouped = filtered.reduce<Record<string, CommandItem[]>>((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = []
    acc[cmd.category].push(cmd)
    return acc
  }, {})

  const flatFiltered = Object.values(grouped).flat()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen((prev) => {
          if (!prev) {
            setQuery("")
            setSelectedIndex(0)
            setTimeout(() => inputRef.current?.focus(), 50)
          }
          return !prev
        })
      }
      if (e.key === "Escape") {
        setOpen(false)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  const handleQueryChange = (value: string) => {
    setQuery(value)
    setSelectedIndex(0)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((prev) => Math.min(prev + 1, flatFiltered.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((prev) => Math.max(prev - 1, 0))
    } else if (e.key === "Enter") {
      e.preventDefault()
      const cmd = flatFiltered[selectedIndex]
      if (cmd) {
        cmd.action()
        setOpen(false)
      }
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-9999 flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />

      {/* Palette */}
      <div className="relative w-full max-w-lg animate-fade-in-up overflow-hidden rounded-2xl border border-border/50 bg-card shadow-2xl">
        {/* Search input */}
        <div className="flex items-center gap-3 border-b border-border/50 px-4">
          <Search className="h-5 w-5 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search..."
            className="h-14 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="hidden rounded-md border border-border bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-80 overflow-y-auto p-2">
          {flatFiltered.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              No results found for "{query}"
            </div>
          ) : (
            Object.entries(grouped).map(([category, items]) => (
              <div key={category}>
                <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                  {category}
                </p>
                {items.map((cmd) => {
                  const globalIdx = flatFiltered.indexOf(cmd)
                  return (
                    <button
                      key={cmd.id}
                      onClick={() => {
                        cmd.action()
                        setOpen(false)
                      }}
                      onMouseEnter={() => setSelectedIndex(globalIdx)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                        globalIdx === selectedIndex
                          ? "bg-primary/10 text-primary"
                          : "text-foreground hover:bg-muted/50"
                      }`}
                    >
                      <cmd.icon className="h-4 w-4 shrink-0" />
                      <span className="flex-1">{cmd.label}</span>
                      {cmd.description && (
                        <span className="text-xs text-muted-foreground">{cmd.description}</span>
                      )}
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border/50 px-4 py-2 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-border bg-muted px-1 py-0.5 text-[10px]">↑</kbd>
              <kbd className="rounded border border-border bg-muted px-1 py-0.5 text-[10px]">↓</kbd>
              navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-border bg-muted px-1 py-0.5 text-[10px]">↵</kbd>
              select
            </span>
          </div>
          <span>
            <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px]">⌘K</kbd> to toggle
          </span>
        </div>
      </div>
    </div>
  )
}
