import { router, usePage } from "@inertiajs/react"
import {
  ArrowRight,
  Bot,
  ClipboardPlus,
  LayoutDashboard,
  Stethoscope,
  X,
  Sparkles,
} from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"

interface TutorialStep {
  id: string
  title: string
  description: string
  icon: React.ElementType
  targetSelector?: string
  navigateTo?: string
  position?: "right" | "bottom" | "center"
}

const STEPS: TutorialStep[] = [
  {
    id: "welcome",
    title: "Welcome to Medica! 👋",
    description:
      "Let's take a quick tour. I'll guide you through the key features — this takes about 30 seconds. You can skip anytime.",
    icon: Sparkles,
    position: "center",
  },
  {
    id: "dashboard",
    title: "Your Dashboard",
    description:
      "This is your command center. See efficiency scores, visit trends, top doctors, and AI-powered next steps — all at a glance.",
    icon: LayoutDashboard,
    navigateTo: "/dashboard",
    targetSelector: '[data-tour="dashboard"]',
    position: "right",
  },
  {
    id: "log_visit",
    title: "Log a Visit",
    description:
      "After every doctor meeting, log it here. Select the doctor, objectives discussed, add notes — the AI calculates your efficiency score automatically.",
    icon: ClipboardPlus,
    navigateTo: "/dashboard",
    targetSelector: '[data-tour="log-visit"]',
    position: "right",
  },
  {
    id: "doctors",
    title: "Doctor Directory",
    description:
      "View all your doctors, see individual trends, and track relationship progress over time. Click any doctor for detailed analytics.",
    icon: Stethoscope,
    navigateTo: "/dashboard",
    targetSelector: '[data-tour="doctors"]',
    position: "right",
  },
  {
    id: "ai_coach",
    title: "AI Coach",
    description:
      "Your personal AI assistant. Ask about performance, get suggestions, and receive coaching tips. Also available via the floating button!",
    icon: Bot,
    navigateTo: "/dashboard",
    targetSelector: '[data-tour="ai-coach"]',
    position: "right",
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

    if (nextIndex >= STEPS.length) {
      setDismissed(true)
      sessionStorage.setItem("medica_tutorial_dismissed", "1")
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
          <button
            onClick={skipTutorial}
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Skip tour
          </button>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-muted-foreground">
              {currentStep + 1} of {STEPS.length}
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
