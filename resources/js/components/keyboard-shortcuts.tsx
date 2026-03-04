import { Keyboard, X } from "lucide-react"
import { useEffect, useState } from "react"

const SHORTCUTS = [
  { keys: ["⌘", "K"], description: "Open command palette" },
  { keys: ["⌘", "B"], description: "Toggle sidebar" },
  { keys: ["⌘", "/"], description: "Toggle keyboard shortcuts" },
  { keys: ["G", "D"], description: "Go to Dashboard" },
  { keys: ["G", "V"], description: "Go to Visits" },
  { keys: ["G", "N"], description: "New Visit" },
  { keys: ["G", "O"], description: "Go to Doctors" },
  { keys: ["G", "A"], description: "Go to AI Coach" },
  { keys: ["G", "M"], description: "Go to Medications" },
  { keys: ["Esc"], description: "Close dialogs / panels" },
]

export function KeyboardShortcuts() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "/") {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
      if (e.key === "Escape" && open) {
        setOpen(false)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  })

  if (!open) return null

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />

      <div className="relative w-full max-w-md animate-fade-in-up overflow-hidden rounded-2xl border border-border/50 bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/50 px-6 py-4">
          <div className="flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Keyboard Shortcuts</h3>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Shortcuts list */}
        <div className="max-h-96 overflow-y-auto p-4">
          <div className="space-y-1">
            {SHORTCUTS.map((shortcut, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-muted/50"
              >
                <span className="text-sm text-foreground">{shortcut.description}</span>
                <div className="flex items-center gap-1">
                  {shortcut.keys.map((key, kIdx) => (
                    <kbd
                      key={kIdx}
                      className="inline-flex min-w-7 items-center justify-center rounded-md border border-border bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground"
                    >
                      {key}
                    </kbd>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border/50 px-6 py-3">
          <p className="text-center text-xs text-muted-foreground">
            Press <kbd className="rounded border border-border bg-muted px-1 py-0.5 text-[10px]">⌘/</kbd> to toggle
          </p>
        </div>
      </div>
    </div>
  )
}
