import { Button } from "@/components/ui/button"
import type { Auth } from "@/types"
import { router, usePage } from "@inertiajs/react"
import {
  AlertTriangle,
  ArrowUp,
  BarChart3,
  Bot,
  Brain,
  CheckCircle2,
  Clock,
  ExternalLink,
  Lightbulb,
  Loader2,
  Send,
  Shield,
  Sparkles,
  Target,
  Timer,
  TrendingUp,
  Trophy,
} from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"

import DashboardLayout from "../layout"

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────

type Insight = {
  type: string
  icon: string
  title: string
  message: string
  priority: string
}

type QuickAction = {
  label: string
  icon: string
}

type ChatAction = {
  label: string
  href: string
}

type ChatMessage = {
  id: string
  role: "user" | "assistant"
  content: string
  actions?: ChatAction[]
  timestamp: Date
}

type PageProps = {
  insights: Insight[]
  quickActions: QuickAction[]
  chatHistory: ChatMessage[]
  auth: Auth
}

// ────────────────────────────────────────────────────────────
// Icon map
// ────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ReactNode> = {
  alert: <AlertTriangle className="h-4 w-4" />,
  clock: <Clock className="h-4 w-4" />,
  target: <Target className="h-4 w-4" />,
  "trending-up": <TrendingUp className="h-4 w-4" />,
  brain: <Brain className="h-4 w-4" />,
  trophy: <Trophy className="h-4 w-4" />,
  plus: <Sparkles className="h-4 w-4" />,
  shield: <Shield className="h-4 w-4" />,
  "bar-chart": <BarChart3 className="h-4 w-4" />,
  timer: <Timer className="h-4 w-4" />,
}

function getInsightIcon(icon: string) {
  return ICON_MAP[icon] ?? <Lightbulb className="h-4 w-4" />
}

function priorityColor(priority: string) {
  if (priority === "high") return "border-red-500/30 bg-red-500/5"
  if (priority === "medium") return "border-amber-500/30 bg-amber-500/5"
  return "border-emerald-500/30 bg-emerald-500/5"
}

function typeColor(type: string) {
  if (type === "warning") return "bg-amber-500"
  if (type === "success") return "bg-emerald-500"
  if (type === "action") return "bg-orange-500"
  if (type === "coaching") return "bg-rose-500"
  if (type === "strategy") return "bg-teal-500"
  return "bg-stone-500"
}

// ────────────────────────────────────────────────────────────
// Markdown-light renderer (bold + newlines + table)
// ────────────────────────────────────────────────────────────

function renderMarkdown(text: string) {
  if (!text) return null
  const lines = text.split("\n")
  const elements: React.ReactNode[] = []
  let tableRows: string[][] = []
  let inTable = false

  const flushTable = () => {
    if (tableRows.length === 0) return
    elements.push(
      <div key={`table-${elements.length}`} className="my-2 overflow-x-auto rounded-lg border border-border/50">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border/50 bg-muted/30">
              {tableRows[0].map((cell, i) => (
                <th key={i} className="px-3 py-1.5 text-left font-semibold text-foreground">
                  {renderInline(cell)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableRows.slice(2).map((row, ri) => (
              <tr key={ri} className="border-b border-border/30 last:border-0">
                {row.map((cell, ci) => (
                  <td key={ci} className="px-3 py-1.5 text-muted-foreground">
                    {renderInline(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>,
    )
    tableRows = []
    inTable = false
  }

  for (const line of lines) {
    if (line.startsWith("|") && line.endsWith("|")) {
      inTable = true
      const cells = line
        .split("|")
        .slice(1, -1)
        .map((c) => c.trim())
      tableRows.push(cells)
      continue
    }
    if (inTable) flushTable()

    if (line.trim() === "") {
      elements.push(<br key={`br-${elements.length}`} />)
    } else {
      elements.push(
        <span key={`l-${elements.length}`} className="block">
          {renderInline(line)}
        </span>,
      )
    }
  }
  if (inTable) flushTable()
  return elements
}

function renderInline(text: string) {
  if (!text) return null
  const parts = text.split(/(\*\*[^*]+\*\*)/)
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      )
    }
    return part
  })
}

// ────────────────────────────────────────────────────────────
// Main Page
// ────────────────────────────────────────────────────────────

export default function AiCoachPage() {
  const { insights, quickActions, auth } = usePage<{ props: PageProps }>().props as unknown as PageProps
  const user = auth.user
  const firstName = (user?.name ?? "User").split(" ")[0]

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        `Hey ${firstName}! 👋 I'm your **AI Performance Coach**.\n\n` +
        `I can help you with:\n` +
        `• Improving your **efficiency scores**\n` +
        `• Strategies for **difficult doctors**\n` +
        `• **Objective planning** and visit prep\n` +
        `• **Time management** tips\n` +
        `• **Follow-up** tracking\n\n` +
        `Ask me anything or tap a quick action below!`,
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [thinkingPhase, setThinkingPhase] = useState<"thinking" | "typing" | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const typewriterReveal = useCallback((fullText: string, actions?: ChatAction[]) => {
    setThinkingPhase("typing")
    const msgId = `assistant-${Date.now()}`
    setMessages((prev) => [...prev, {
      id: msgId,
      role: "assistant",
      content: "",
      actions,
      timestamp: new Date(),
    }])

    let i = 0
    const chunkSize = 4
    const interval = setInterval(() => {
      i += chunkSize
      if (i >= fullText.length) {
        clearInterval(interval)
        setMessages((prev) => {
          const copy = [...prev]
          copy[copy.length - 1] = { ...copy[copy.length - 1], content: fullText }
          return copy
        })
        setThinkingPhase(null)
        setIsLoading(false)
        inputRef.current?.focus()
      } else {
        setMessages((prev) => {
          const copy = [...prev]
          copy[copy.length - 1] = { ...copy[copy.length - 1], content: fullText.slice(0, i) }
          return copy
        })
      }
    }, 15)
  }, [])

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: text.trim(),
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, userMsg])
      setInput("")
      setIsLoading(true)
      setThinkingPhase("thinking")

      try {
        const response = await fetch("/ai-coach/ask", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "X-CSRF-TOKEN": (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? "",
            "X-Requested-With": "XMLHttpRequest",
          },
          body: JSON.stringify({ message: text.trim() }),
        })

        const data = await response.json()

        if (!response.ok || !data.reply) {
          throw new Error("Bad response")
        }

        typewriterReveal(data.reply, data.actions ?? [])
      } catch {
        setThinkingPhase(null)
        setIsLoading(false)
        setMessages((prev) => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            role: "assistant",
            content: "Sorry, something went wrong. Please try again.",
            timestamp: new Date(),
          },
        ])
        inputRef.current?.focus()
      }
    },
    [isLoading, typewriterReveal],
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  return (
    <DashboardLayout>
      <div className="flex h-screen flex-col overflow-hidden lg:flex-row">
        {/* Left panel — Insights */}
        <div className="hidden w-80 shrink-0 flex-col border-r border-border/50 bg-card/30 backdrop-blur-sm lg:flex">
          <div className="border-b border-border/50 p-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-md">
                <Brain className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground">Performance Insights</h2>
                <p className="text-[10px] text-muted-foreground">Auto-generated from your data</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            <div className="flex flex-col gap-2">
              {insights.length === 0 && (
                <div className="flex flex-col items-center gap-2 py-8 text-center">
                  <Sparkles className="h-8 w-8 text-muted-foreground/30" />
                  <p className="text-xs text-muted-foreground">
                    Log some visits to see personalized insights here.
                  </p>
                </div>
              )}
              {insights.map((insight, idx) => (
                <div
                  key={idx}
                  className={`animate-fade-in-up rounded-xl border p-3 transition-all duration-300 hover:shadow-md ${priorityColor(insight.priority)}`}
                  style={{ animationDelay: `${idx * 80}ms` }}
                >
                  <div className="mb-1.5 flex items-center gap-2">
                    <div className={`flex h-6 w-6 items-center justify-center rounded-full text-white ${typeColor(insight.type)}`}>
                      {getInsightIcon(insight.icon)}
                    </div>
                    <span className="text-xs font-bold text-foreground">{insight.title}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-muted-foreground">{insight.message}</p>
                  {insight.priority === "high" && (
                    <div className="mt-2 flex items-center gap-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-[9px] font-semibold uppercase tracking-wider text-red-500">
                        High Priority
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main chat area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Chat header */}
          <div className="flex items-center justify-between border-b border-border/50 bg-card/50 px-6 py-3 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background bg-emerald-500" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-foreground">AI Performance Coach</h1>
                <p className="flex items-center gap-1 text-[11px] text-emerald-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Online — Ready to help
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-medium text-primary">
                Rule-based AI
              </span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto bg-background px-4 py-4 sm:px-6">
            <div className="mx-auto flex max-w-2xl flex-col gap-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`animate-fade-in-up flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  {/* Avatar */}
                  <div className="shrink-0">
                    {msg.role === "assistant" ? (
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white shadow-sm">
                        <Bot className="h-4 w-4" />
                      </div>
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-xs font-bold text-primary">
                        {(user?.name ?? "U")
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </div>
                    )}
                  </div>

                  {/* Bubble */}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : "bg-card border border-border/50 text-foreground shadow-sm rounded-tl-sm"
                    }`}
                  >
                    <div className="space-y-1">{renderMarkdown(msg.content)}</div>

                    {/* Action buttons */}
                    {msg.actions && msg.actions.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2 border-t border-border/30 pt-3">
                        {msg.actions.map((action, ai) => (
                          <button
                            key={ai}
                            onClick={() => router.visit(action.href)}
                            className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-all hover:bg-primary/20 hover:shadow-sm"
                          >
                            <ExternalLink className="h-3 w-3" />
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Timestamp */}
                    <p className={`mt-2 text-[10px] ${msg.role === "user" ? "text-primary-foreground/60" : "text-muted-foreground/60"}`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isLoading && thinkingPhase === "thinking" && (
                <div className="flex gap-3 animate-fade-in-up">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white shadow-sm">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="rounded-2xl rounded-tl-sm border border-border/50 bg-card px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                      <span className="text-xs text-muted-foreground">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Quick actions */}
          <div className="border-t border-border/30 bg-card/30 px-4 py-2 backdrop-blur-sm sm:px-6">
            <div className="mx-auto flex max-w-2xl gap-2 overflow-x-auto pb-1">
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => sendMessage(action.label)}
                  disabled={isLoading}
                  className="flex shrink-0 items-center gap-1.5 rounded-full border border-border/50 bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-primary disabled:opacity-50"
                >
                  {getInsightIcon(action.icon)}
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="border-t border-border/50 bg-card/50 px-4 py-3 backdrop-blur-sm sm:px-6">
            <form onSubmit={handleSubmit} className="mx-auto flex max-w-2xl items-center gap-2">
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about scores, doctors, objectives..."
                  disabled={isLoading}
                  className="w-full rounded-xl border border-border/50 bg-background px-4 py-2.5 pr-12 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/10 disabled:opacity-50"
                />
                {input.length > 0 && !isLoading && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <button
                      type="submit"
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-md"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
              <Button
                type="submit"
                disabled={isLoading || !input.trim()}
                size="sm"
                className="h-10 rounded-xl bg-primary px-4 text-white shadow-md transition-all hover:bg-primary/90 hover:shadow-lg disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Send className="mr-1.5 h-3.5 w-3.5" />
                    Send
                  </>
                )}
              </Button>
            </form>
            <p className="mx-auto mt-1.5 max-w-2xl text-center text-[10px] text-muted-foreground/40">
              AI Coach provides data-driven suggestions based on your visit history
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
