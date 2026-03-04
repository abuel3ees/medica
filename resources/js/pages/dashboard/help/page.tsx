import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { Auth } from "@/types"
import { Link, usePage } from "@inertiajs/react"
import {
  ArrowLeft,
  BookOpen,
  Bot,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  HelpCircle,
  LayoutDashboard,
  Rocket,
  Search,
  Shield,
  Sparkles,
  Stethoscope,
  Zap,
} from "lucide-react"
import { useCallback, useMemo, useState } from "react"

import DashboardLayout from "../layout"

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Article = { title: string; content: string }
type Section = {
  id: string
  title: string
  icon: string
  description: string
  articles: Article[]
}

type HelpPageProps = {
  sections: Section[]
  auth: Auth
}

/* ------------------------------------------------------------------ */
/*  Icon map                                                           */
/* ------------------------------------------------------------------ */

const ICON_MAP: Record<string, typeof Rocket> = {
  rocket: Rocket,
  zap: Zap,
  clipboard: ClipboardList,
  layout: LayoutDashboard,
  bot: Bot,
  shield: Shield,
  stethoscope: Stethoscope,
}

const COLOR_MAP: Record<string, string> = {
  rocket: "bg-orange-500",
  zap: "bg-emerald-500",
  clipboard: "bg-rose-500",
  layout: "bg-amber-500",
  bot: "bg-teal-500",
  shield: "bg-rose-600",
  stethoscope: "bg-orange-500",
}

/* ------------------------------------------------------------------ */
/*  Simple Markdown renderer                                           */
/* ------------------------------------------------------------------ */

function renderMarkdown(text: string) {
  const lines = text.split("\n")
  const elements: React.ReactNode[] = []
  let tableRows: string[][] = []
  let inTable = false
  let tableHeaders: string[] = []

  const flushTable = () => {
    if (tableHeaders.length === 0) return
    elements.push(
      <div key={`table-${elements.length}`} className="my-3 overflow-x-auto rounded-lg border border-border/50">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50 bg-muted/30">
              {tableHeaders.map((h, i) => (
                <th key={i} className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">
                  {renderInline(h.trim())}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableRows.map((row, ri) => (
              <tr key={ri} className="border-b border-border/20 last:border-b-0">
                {row.map((cell, ci) => (
                  <td key={ci} className="px-3 py-2 text-foreground">
                    {renderInline(cell.trim())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>,
    )
    tableHeaders = []
    tableRows = []
    inTable = false
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    // Table separator line
    if (/^\|[\s-:|]+\|$/.test(line)) continue

    // Table row
    if (line.startsWith("|") && line.endsWith("|")) {
      const cells = line
        .slice(1, -1)
        .split("|")
        .map((c) => c.trim())
      if (!inTable) {
        inTable = true
        tableHeaders = cells
        // Check if next line is separator
        if (i + 1 < lines.length && /^\|[\s-:|]+\|$/.test(lines[i + 1])) {
          i++ // skip separator
        }
      } else {
        tableRows.push(cells)
      }
      continue
    }

    if (inTable) flushTable()

    if (line.trim() === "") {
      elements.push(<div key={`br-${i}`} className="h-2" />)
    } else if (line.startsWith("- **") || line.startsWith("- *")) {
      elements.push(
        <div key={`li-${i}`} className="flex gap-2 py-0.5 pl-1">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
          <span className="text-sm text-foreground/90">{renderInline(line.slice(2))}</span>
        </div>,
      )
    } else if (/^\d+\.\s/.test(line)) {
      const match = line.match(/^(\d+)\.\s(.+)/)
      if (match) {
        elements.push(
          <div key={`ol-${i}`} className="flex gap-2.5 py-0.5 pl-1">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
              {match[1]}
            </span>
            <span className="text-sm text-foreground/90">{renderInline(match[2])}</span>
          </div>,
        )
      }
    } else {
      elements.push(
        <p key={`p-${i}`} className="text-sm leading-relaxed text-foreground/90">
          {renderInline(line)}
        </p>,
      )
    }
  }

  if (inTable) flushTable()

  return <>{elements}</>
}

function renderInline(text: string): React.ReactNode {
  // Bold + italic patterns
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/)
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      )
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <em key={i} className="italic text-foreground/80">
          {part.slice(1, -1)}
        </em>
      )
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={i} className="rounded bg-muted/60 px-1.5 py-0.5 font-mono text-xs text-primary">
          {part.slice(1, -1)}
        </code>
      )
    }
    return part
  })
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */

export default function HelpPage() {
  const page = usePage<{ props: HelpPageProps }>()
  const { sections } = page.props as unknown as HelpPageProps

  const [search, setSearch] = useState("")
  const [expandedSection, setExpandedSection] = useState<string | null>("getting-started")
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null)

  // Filter sections and articles by search
  const filtered = useMemo(() => {
    if (!search.trim()) return sections
    const q = search.toLowerCase()
    return sections
      .map((section) => ({
        ...section,
        articles: section.articles.filter(
          (a) =>
            a.title.toLowerCase().includes(q) ||
            a.content.toLowerCase().includes(q) ||
            section.title.toLowerCase().includes(q),
        ),
      }))
      .filter((s) => s.articles.length > 0)
  }, [sections, search])

  const totalArticles = sections.reduce((sum, s) => sum + s.articles.length, 0)

  const toggleSection = useCallback(
    (id: string) => {
      setExpandedSection((prev) => (prev === id ? null : id))
      setExpandedArticle(null)
    },
    [],
  )

  const toggleArticle = useCallback((key: string) => {
    setExpandedArticle((prev) => (prev === key ? null : key))
  }, [])

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 p-6">
        {/* Header */}
        <div className="animate-fade-in-up">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-md">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    Help & Documentation
                    <Sparkles className="ml-2 inline h-5 w-5 text-accent" />
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {sections.length} sections · {totalArticles} articles · Everything you need to know
                  </p>
                </div>
              </div>
            </div>
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowLeft className="h-3.5 w-3.5" />
                Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Search */}
        <div className="animate-fade-in-up" style={{ animationDelay: "80ms" }}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search documentation... (e.g. 'efficiency score', 'stance', 'AI coach')"
              className="h-11 pl-10 bg-card/80 border-border/50 backdrop-blur-sm"
            />
            {search && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-7 px-2 text-xs text-muted-foreground"
              >
                Clear
              </Button>
            )}
          </div>
          {search && (
            <p className="mt-2 text-xs text-muted-foreground">
              Found {filtered.reduce((sum, s) => sum + s.articles.length, 0)} articles matching "{search}"
            </p>
          )}
        </div>

        {/* Quick links grid */}
        {!search && (
          <div className="animate-fade-in-up grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4" style={{ animationDelay: "120ms" }}>
            {sections.map((section) => {
              const Icon = ICON_MAP[section.icon] || HelpCircle
              const gradient = COLOR_MAP[section.icon] || "bg-primary"
              return (
                <button
                  key={section.id}
                  onClick={() => {
                    toggleSection(section.id)
                    document.getElementById(`section-${section.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" })
                  }}
                  className="group card-hover flex flex-col items-center gap-2 rounded-xl border border-border/50 bg-card/80 p-4 text-center backdrop-blur-sm transition-all duration-200"
                >
                  <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl shadow-sm transition-transform duration-200 group-hover:scale-110", gradient)}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-foreground">{section.title}</span>
                  <span className="text-[10px] text-muted-foreground">{section.articles.length} articles</span>
                </button>
              )
            })}
          </div>
        )}

        {/* Sections accordion */}
        <div className="flex flex-col gap-3">
          {filtered.map((section, sIdx) => {
            const Icon = ICON_MAP[section.icon] || HelpCircle
            const gradient = COLOR_MAP[section.icon] || "bg-primary"
            const isOpen = expandedSection === section.id || !!search

            return (
              <Card
                key={section.id}
                id={`section-${section.id}`}
                className="animate-fade-in-up overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm"
                style={{ animationDelay: `${160 + sIdx * 60}ms` }}
              >
                <CardHeader
                  className="cursor-pointer border-b border-border/30 pb-3 transition-colors hover:bg-muted/20"
                  onClick={() => toggleSection(section.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg shadow-sm", gradient)}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-bold text-foreground">{section.title}</CardTitle>
                        <p className="text-[11px] text-muted-foreground">{section.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px]">
                        {section.articles.length} articles
                      </Badge>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 text-muted-foreground transition-transform duration-200",
                          isOpen && "rotate-180",
                        )}
                      />
                    </div>
                  </div>
                </CardHeader>
                {isOpen && (
                  <CardContent className="p-0">
                    <div className="divide-y divide-border/20">
                      {section.articles.map((article, aIdx) => {
                        const artKey = `${section.id}-${aIdx}`
                        const isArticleOpen = expandedArticle === artKey || !!search
                        return (
                          <div key={aIdx}>
                            <button
                              onClick={() => toggleArticle(artKey)}
                              className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-muted/10"
                            >
                              <div className="flex items-center gap-3">
                                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-[10px] font-bold text-primary">
                                  {aIdx + 1}
                                </div>
                                <span className="text-sm font-medium text-foreground">{article.title}</span>
                              </div>
                              <ChevronRight
                                className={cn(
                                  "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
                                  isArticleOpen && "rotate-90",
                                )}
                              />
                            </button>
                            {isArticleOpen && (
                              <div className="border-t border-border/10 bg-muted/5 px-4 py-4 pl-[52px]">
                                {renderMarkdown(article.content)}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                )}
              </Card>
            )
          })}

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <HelpCircle className="mb-3 h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm font-medium text-foreground">No results found</p>
              <p className="text-xs text-muted-foreground">Try a different search term</p>
            </div>
          )}
        </div>

        {/* Keyboard shortcuts / tips footer */}
        <div className="animate-fade-in-up rounded-xl border border-border/50 bg-primary/5 p-4" style={{ animationDelay: "600ms" }}>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Pro Tips</h3>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { tip: "Log visits the same day for the most accurate data", icon: "📝" },
              { tip: "Focus on high-weight objectives to maximize your score", icon: "🎯" },
              { tip: "Always set next steps — it earns you a +0.10 bonus", icon: "📋" },
              { tip: "Difficult doctors give 1.15× multiplier — don't avoid them!", icon: "💪" },
              { tip: "Check AI Coach daily for personalized improvement tips", icon: "🤖" },
              { tip: "Keep visits under 15 min for the best time factor", icon: "⏱️" },
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2 rounded-lg bg-card/60 p-2.5 border border-border/30">
                <span className="text-base">{item.icon}</span>
                <span className="text-xs text-muted-foreground">{item.tip}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
