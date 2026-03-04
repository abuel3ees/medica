import { usePage } from "@inertiajs/react"
import { usePermissions } from "@/hooks/use-permissions"
import { Bot, Send, X, Minimize2, Maximize2, Sparkles } from "lucide-react"
import { useEffect, useRef, useState } from "react"

interface Message {
  role: "user" | "assistant"
  content: string
  isTyping?: boolean
}

export function FloatingAI() {
  const page = usePage()
  const { can } = usePermissions()
  const featureFlags = page.props.featureFlags ?? {}
  const aiEnabled = featureFlags.ai_coaching !== false && can("use ai coach")

  const [open, setOpen] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [thinkingPhase, setThinkingPhase] = useState<"thinking" | "typing" | null>(null)
  const [pulse, setPulse] = useState(true)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, thinkingPhase])

  // Disable pulse after first open
  useEffect(() => {
    if (open) setPulse(false)
  }, [open])

  if (!aiEnabled) return null

  const typewriterReveal = (fullText: string) => {
    setThinkingPhase("typing")
    // Add the message with empty content
    setMessages((prev) => [...prev, { role: "assistant", content: "", isTyping: true }])

    let i = 0
    const chunkSize = 3 // characters per tick for speed
    const interval = setInterval(() => {
      i += chunkSize
      if (i >= fullText.length) {
        // Done typing
        clearInterval(interval)
        setMessages((prev) => {
          const copy = [...prev]
          copy[copy.length - 1] = { role: "assistant", content: fullText, isTyping: false }
          return copy
        })
        setThinkingPhase(null)
        setLoading(false)
      } else {
        setMessages((prev) => {
          const copy = [...prev]
          copy[copy.length - 1] = { role: "assistant", content: fullText.slice(0, i), isTyping: true }
          return copy
        })
      }
    }, 18)
  }

  const sendMessage = async (override?: string) => {
    const msg = override ?? input.trim()
    if (!msg || loading) return
    setInput("")
    setMessages((prev) => [...prev, { role: "user", content: msg }])
    setLoading(true)
    setThinkingPhase("thinking")

    try {
      const token = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content
      const res = await fetch("/ai-coach/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": token ?? "",
          "X-Requested-With": "XMLHttpRequest",
          Accept: "application/json",
        },
        body: JSON.stringify({ message: msg }),
      })

      if (res.ok) {
        const data = await res.json()
        const reply = data.reply ?? "No response received."
        typewriterReveal(reply)
      } else {
        setThinkingPhase(null)
        setLoading(false)
        setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I couldn't process that. Try again." }])
      }
    } catch {
      setThinkingPhase(null)
      setLoading(false)
      setMessages((prev) => [...prev, { role: "assistant", content: "Connection error. Please try again." }])
    }
  }

  const quickQuestions = [
    "How can I improve my scores?",
    "Which doctors need attention?",
    "What are my objectives?",
  ]

  // Don't show on AI coach page
  if (typeof window !== "undefined" && window.location.pathname.startsWith("/ai-coach")) {
    return null
  }

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-xl transition-all hover:scale-105 hover:shadow-2xl active:scale-95"
        >
          <Bot className="h-6 w-6 text-white" />
          {pulse && (
            <span className="absolute inset-0 animate-ping rounded-full bg-primary/30" />
          )}
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-white">
            AI
          </span>
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card shadow-2xl transition-all duration-300 ${
            minimized ? "h-14 w-72" : "h-125 w-95"
          }`}
        >
          {/* Header */}
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-border/50 bg-primary px-4">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-white" />
              <span className="text-sm font-semibold text-white">AI Coach</span>
              <Sparkles className="h-3 w-3 text-white/60" />
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setMinimized(!minimized)}
                className="rounded-lg p-1.5 text-white/70 transition-colors hover:text-white"
              >
                {minimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </button>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-white/70 transition-colors hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {!minimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && (
                  <div className="space-y-3">
                    <div className="rounded-xl bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground">
                        👋 Hi! I'm your AI coach. Ask me about your performance, doctors, objectives, or visit strategies.
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      {quickQuestions.map((q) => (
                        <button
                          key={q}
                          onClick={() => { sendMessage(q); }}
                          className="block w-full rounded-lg border border-border/50 px-3 py-2 text-left text-xs text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted/50 text-foreground"
                      }`}
                    >
                      <p className="whitespace-pre-wrap text-[13px] leading-relaxed">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="rounded-xl bg-muted/50 px-4 py-3">
                      {thinkingPhase === "thinking" ? (
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                          <span className="text-xs text-muted-foreground">Thinking...</span>
                        </div>
                      ) : (
                        <div className="flex gap-1">
                          <span className="h-2 w-2 animate-bounce rounded-full bg-primary/40" style={{ animationDelay: "0ms" }} />
                          <span className="h-2 w-2 animate-bounce rounded-full bg-primary/40" style={{ animationDelay: "150ms" }} />
                          <span className="h-2 w-2 animate-bounce rounded-full bg-primary/40" style={{ animationDelay: "300ms" }} />
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-border/50 p-3">
                <form
                  onSubmit={(e) => { e.preventDefault(); sendMessage() }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask anything..."
                    className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || loading}
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}
