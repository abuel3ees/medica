import { router, usePage } from "@inertiajs/react"
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Bot,
  ClipboardPlus,
  Command,
  Keyboard,
  LayoutDashboard,
  Pill,
  Stethoscope,
  Target,
  X,
  Sparkles,
  BookOpen,
  Activity,
} from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"

interface TutorialStep {
  id: string
  title: string
  description: string
  tip?: string
  icon: React.ElementType
  targetSelector?: string
  navigateTo?: string
  position?: "right" | "bottom" | "center"
}

const STEPS: TutorialStep[] = [
  {
    id: "welcome",
    title: "Welcome to Medica! 👋",
    description: "This tour will walk you through everything — your dashboard, logging visits, managing doctors, using the AI coach, and more. Takes about 2 minutes.",
    tip: "You can skip or resume anytime. Your progress is saved.",
    icon: Sparkles,
    position: "center",
  },
  {
    id: "dashboard",
    title: "Your Dashboard",
    description: "This is your home base. You'll see your efficiency score, recent visits, top doctors, and AI-generated next steps. Everything updates in real time as you log visits.",
    tip: "Tip: The score at the top is your rolling average. It goes up when you hit your objectives consistently.",
    icon: LayoutDashboard,
    navigateTo: "/dashboard",
    targetSelector: '[data-tour="dashboard"]',
    position: "right",
  },
  {
    id: "log_visit",
    title: "Log a Visit",
    description: "After meeting a doctor, log it here. Select the doctor, check off the objectives you discussed, rate how well each went, and add any notes. The efficiency score is calculated automatically.",
    tip: "Tip: Logging visits the same day gives you the most accurate data. Setting next steps earns you bonus points.",
    icon: ClipboardPlus,
    navigateTo: "/dashboard",
    targetSelector: '[data-tour="log-visit"]',
    position: "right",
  },
  {
    id: "doctors",
    title: "Doctor Directory",
    description: "Your full list of doctors. Click any doctor to see their complete profile — visit history, how your relationship has evolved, which objectives work best, and suggested next actions.",
    tip: "Tip: Difficult doctors give you a 1.15× score multiplier. Don't avoid them!",
    icon: Stethoscope,
    navigateTo: "/dashboard",
    targetSelector: '[data-tour="doctors"]',
    position: "right",
  },
  {
    id: "visits",
    title: "Visit History",
    description: "See every visit you've logged, sorted by date. Filter by doctor, date range, or score. Click any visit to see its full breakdown — objectives, scores, notes, and AI feedback.",
    tip: "Tip: Managers can see all reps' visits here. Reps only see their own.",
    icon: Activity,
    navigateTo: "/dashboard",
    targetSelector: '[data-tour="visits"]',
    position: "right",
  },
  {
    id: "objectives",
    title: "Objectives",
    description: "These are the goals you track during visits — things like Product Presentation, Sample Drop, or Clinical Data Sharing. Each has a category, importance level, and weight that affects your score.",
    tip: "Tip: Focus on high-weight objectives to maximize your efficiency score.",
    icon: Target,
    navigateTo: "/dashboard",
    targetSelector: '[data-tour="objectives"]',
    position: "right",
  },
  {
    id: "medications",
    title: "Medications",
    description: "Manage your product catalog here. Add medications with their details so you can reference them when logging visits and tracking which products you've discussed with each doctor.",
    icon: Pill,
    navigateTo: "/dashboard",
    targetSelector: '[data-tour="medications"]',
    position: "right",
  },
  {
    id: "ai_coach",
    title: "AI Coach",
    description: "Your personal performance assistant. Ask it anything — 'How can I improve my score?', 'Which doctors need attention?', 'What should I focus on this week?' It knows all your data.",
    tip: "Tip: The AI coach is also available as a floating button on every page. You can ask it quick questions without leaving what you're doing.",
    icon: Bot,
    navigateTo: "/dashboard",
    targetSelector: '[data-tour="ai-coach"]',
    position: "right",
  },
  {
    id: "help",
    title: "Help & Documentation",
    description: "Full documentation with guides on scoring, visit logging, objectives, the AI coach, and more. If you're ever unsure how something works, check here first.",
    icon: BookOpen,
    navigateTo: "/dashboard",
    targetSelector: '[data-tour="help"]',
    position: "right",
  },
  {
    id: "notifications",
    title: "Notifications",
    description: "The bell icon in the top bar shows your notifications. Managers can send you updates, the system alerts you about overdue follow-ups, and the AI coach can nudge you with suggestions.",
    tip: "Tip: Click the bell to see all notifications in a dropdown. You can mark them read or dismiss them.",
    icon: Bell,
    navigateTo: "/dashboard",
    targetSelector: '[data-tour="notifications"]',
    position: "bottom",
  },
  {
    id: "command_palette",
    title: "Command Palette",
    description: "Press ⌘K (or Ctrl+K) anywhere to open the command palette. Search for pages, actions, doctors, or settings. It's the fastest way to navigate Medica.",
    tip: "Tip: Try searching 'log visit' or a doctor's name. You can also click the search bar in the top header.",
    icon: Command,
    navigateTo: "/dashboard",
    targetSelector: '[data-tour="command-palette"]',
    position: "bottom",
  },
  {
    id: "shortcuts",
    title: "Keyboard Shortcuts",
    description: "Power users love these. Press ? to see all available shortcuts. You can navigate, search, and take actions without touching the mouse.",
    icon: Keyboard,
    position: "center",
  },
  {
    id: "finish",
    title: "You're all set! 🎉",
    description: "That's everything. Start by logging your first visit — the more data you add, the smarter Medica gets. Your AI coach will have personalized insights within a few visits.",
    tip: "If you ever want to replay this tour, ask your admin to reset it from the Dev Console.",
    icon: Sparkles,
    position: "center",
  },
]

interface SpotlightRect {
  top: number
  left: number
  width: number
  height: number
}

export function OnboardingTutorial() {
  const page = usePage<{
    auth: {
      user: {
        onboarding_completed?: boolean
        onboarding_progress?: Record<string, boolean>
      }
    }
    featureFlags?: Record<string, boolean>
  }>()

  const user = page.props.auth?.user
  const flags = (page.props as { featureFlags?: Record<string, boolean> })
    .featureFlags
  const tutorialEnabled = flags?.onboarding !== false

  const [currentStep, setCurrentStep] = useState(0)
  const [dismissed, setDismissed] = useState(false)
  const [spotlight, setSpotlight] = useState<SpotlightRect | null>(null)
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({})
  const [navigating, setNavigating] = useState(false)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number>(0)

  const sessionDismissed =
    typeof window !== "undefined" &&
    sessionStorage.getItem("medica_tutorial_dismissed")

  const updateSpotlight = useCallback(() => {
    const step = STEPS[currentStep]
    if (!step.targetSelector || step.position === "center") {
      setSpotlight(null)
      setTooltipStyle({
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      })
      return
    }

    const el = document.querySelector(step.targetSelector)
    if (!el) {
      setSpotlight(null)
      setTooltipStyle({
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      })
      return
    }

    const rect = el.getBoundingClientRect()
    const padding = 6

    setSpotlight({
      top: rect.top - padding,
      left: rect.left - padding,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
    })

    if (step.position === "right") {
      setTooltipStyle({
        position: "fixed",
        top: Math.max(16, rect.top - 20),
        left: rect.right + 20,
      })
    } else if (step.position === "bottom") {
      setTooltipStyle({
        position: "fixed",
        top: rect.bottom + 16,
        left: Math.max(16, rect.left),
      })
    }
  }, [currentStep])

  useEffect(() => {
    if (dismissed || sessionDismissed || !tutorialEnabled || !user || user.onboarding_completed) return

    const timeout = setTimeout(() => {
      updateSpotlight()
    }, 200)

    const handleUpdate = () => {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(updateSpotlight)
    }

    window.addEventListener("resize", handleUpdate)
    window.addEventListener("scroll", handleUpdate, true)

    return () => {
      clearTimeout(timeout)
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener("resize", handleUpdate)
      window.removeEventListener("scroll", handleUpdate, true)
    }
  }, [currentStep, dismissed, sessionDismissed, tutorialEnabled, user, updateSpotlight, navigating])

  if (
    !tutorialEnabled ||
    !user ||
    user.onboarding_completed ||
    dismissed ||
    sessionDismissed
  ) {
    return null
  }

  const step = STEPS[currentStep]

  const goToStep = (nextIndex: number) => {
    // Save progress for the current step when going forward
    if (nextIndex > currentStep) {
      const token = document.querySelector<HTMLMetaElement>(
        'meta[name="csrf-token"]',
      )?.content
      fetch("/onboarding/complete-step", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": token ?? "",
          Accept: "application/json",
        },
        body: JSON.stringify({ step: step.id }),
      }).catch(() => {})
    }

    if (nextIndex >= STEPS.length || nextIndex < 0) {
      if (nextIndex >= STEPS.length) {
        setDismissed(true)
        sessionStorage.setItem("medica_tutorial_dismissed", "1")
      }
      return
    }

    const nextStep = STEPS[nextIndex]

    if (
      nextStep.navigateTo &&
      typeof window !== "undefined" &&
      !window.location.pathname.startsWith(nextStep.navigateTo)
    ) {
      setNavigating(true)
      router.visit(nextStep.navigateTo, {
        preserveState: false,
        onFinish: () => {
          setNavigating(false)
          setCurrentStep(nextIndex)
        },
      })
    } else {
      setCurrentStep(nextIndex)
    }
  }

  const skipTutorial = () => {
    const token = document.querySelector<HTMLMetaElement>(
      'meta[name="csrf-token"]',
    )?.content
    fetch("/onboarding/skip", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": token ?? "",
        Accept: "application/json",
      },
    }).catch(() => {})
    setDismissed(true)
    sessionStorage.setItem("medica_tutorial_dismissed", "1")
  }

  const StepIcon = step.icon

  return (
    <div className="fixed inset-0 z-9998">
      {/* Dark overlay with spotlight cutout */}
      <svg className="absolute inset-0 h-full w-full">
        <defs>
          <mask id="spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            {spotlight && (
              <rect
                x={spotlight.left}
                y={spotlight.top}
                width={spotlight.width}
                height={spotlight.height}
                rx={12}
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(0,0,0,0.55)"
          mask="url(#spotlight-mask)"
        />
      </svg>

      {/* Spotlight highlight ring */}
      {spotlight && (
        <div
          className="pointer-events-none absolute rounded-xl border-2 border-primary/80 transition-all duration-300 ease-out"
          style={{
            top: spotlight.top,
            left: spotlight.left,
            width: spotlight.width,
            height: spotlight.height,
            boxShadow: "0 0 0 4000px rgba(0,0,0,0), 0 0 24px 2px var(--primary)",
          }}
        />
      )}

      {/* Tooltip card */}
      <div
        ref={tooltipRef}
        className="absolute z-9999 w-80 animate-fade-in-up rounded-2xl border border-border/50 bg-card p-5 shadow-2xl"
        style={tooltipStyle}
      >
        {/* Close */}
        <button
          onClick={skipTutorial}
          className="absolute right-3 top-3 rounded-lg p-1 text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Progress */}
        <div className="mb-4 flex gap-1.5">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                i <= currentStep ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <StepIcon className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-foreground">{step.title}</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {step.description}
            </p>
            {step.tip && (
              <p className="mt-2 rounded-lg bg-primary/5 px-2.5 py-1.5 text-[11px] leading-relaxed text-primary/80">
                {step.tip}
              </p>
            )}
          </div>
        </div>

        {/* Arrow pointers */}
        {spotlight && step.position === "right" && (
          <div className="absolute -left-1.75 top-8 h-3 w-3 rotate-45 border-b border-l border-border/50 bg-card" />
        )}
        {spotlight && step.position === "bottom" && (
          <div className="absolute -top-1.75 left-8 h-3 w-3 rotate-45 border-l border-t border-border/50 bg-card" />
        )}

        {/* Actions */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                onClick={() => goToStep(currentStep - 1)}
                disabled={navigating}
                className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
              >
                <ArrowLeft className="h-3 w-3" />
                Back
              </button>
            )}
            <button
              onClick={skipTutorial}
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Skip
            </button>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] tabular-nums text-muted-foreground">
              {currentStep + 1}/{STEPS.length}
            </span>
            <button
              onClick={() => goToStep(currentStep + 1)}
              disabled={navigating}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {navigating ? (
                "Loading..."
              ) : currentStep < STEPS.length - 1 ? (
                <>
                  Next
                  <ArrowRight className="h-3 w-3" />
                </>
              ) : (
                "Get Started!"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
