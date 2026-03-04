import { useEffect, useState } from "react"

const LETTERS = ["e", "d", "i", "c", "a"]

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"m-in" | "hold" | "slide" | "tagline" | "fade">("m-in")

  useEffect(() => {
    // Phase 1: M fades in at its final position (already left-aligned where "Medica" will be)
    const t0 = setTimeout(() => setPhase("hold"), 500)
    // Phase 2: Brief hold
    const t1 = setTimeout(() => setPhase("slide"), 1600)
    // Phase 3: All remaining letters slide out simultaneously to the right
    const t2 = setTimeout(() => setPhase("tagline"), 3200)
    // Phase 4: Tagline fades in
    const t3 = setTimeout(() => setPhase("fade"), 4600)
    // Phase 5: Fade out
    const t4 = setTimeout(() => onComplete(), 5300)

    return () => [t0, t1, t2, t3, t4].forEach(clearTimeout)
  }, [onComplete])

  const lettersOut = phase === "slide" || phase === "tagline" || phase === "fade"

  return (
    <div
      className={`fixed inset-0 z-9999 flex items-center justify-center overflow-hidden transition-opacity duration-700 ${
        phase === "fade" ? "opacity-0" : "opacity-100"
      }`}
      style={{ background: "#1A1510" }}
    >
      {/* Subtle dot pattern */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.02) 1px, transparent 0)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Word container — always centered as a group */}
      <div className="relative flex items-baseline">
        {/* "M" — same final size from the start, never zooms/shrinks */}
        <span
          className="inline-block select-none"
          style={{
            fontFamily: "'DM Serif Display', 'Playfair Display', 'Georgia', serif",
            fontWeight: 400,
            fontSize: "clamp(120px, 22vw, 260px)",
            lineHeight: 1,
            letterSpacing: "-0.02em",
            color: "#C46A47",
            opacity: phase === "m-in" ? 0 : 1,
            transition: "opacity 0.6s ease-out",
          }}
        >
          M
        </span>

        {/* Remaining letters — all slide out together at once */}
        <div
          className="flex items-baseline overflow-hidden"
          style={{
            maxWidth: lettersOut ? "1000px" : "0",
            transition: "max-width 1.4s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          {LETTERS.map((letter, i) => (
            <span
              key={i}
              className="inline-block shrink-0"
              style={{
                fontFamily:
                  "'DM Serif Display', 'Playfair Display', 'Georgia', serif",
                fontWeight: 400,
                fontSize: "clamp(120px, 22vw, 260px)",
                lineHeight: 1,
                letterSpacing: "-0.02em",
                color: "#C46A47",
                opacity: lettersOut ? 1 : 0,
                transform: lettersOut ? "translateX(0)" : "translateX(-20px)",
                transition: `opacity 0.7s ease-out, transform 1.4s cubic-bezier(0.22, 1, 0.36, 1)`,
              }}
            >
              {letter}
            </span>
          ))}
        </div>
      </div>

      {/* Tagline */}
      <p
        className="absolute text-xs uppercase tracking-[0.35em] md:text-sm"
        style={{
          fontFamily:
            "'DM Serif Display', 'Playfair Display', 'Georgia', serif",
          fontWeight: 400,
          bottom: "36%",
          color: "rgba(255,255,255,0.28)",
          opacity: phase === "tagline" || phase === "fade" ? 1 : 0,
          transform:
            phase === "tagline" || phase === "fade"
              ? "translateY(0)"
              : "translateY(8px)",
          transition: "opacity 0.6s ease-out, transform 0.6s ease-out",
        }}
      >
      </p>

      {/* Bottom accent line */}
      <div
        className="absolute bottom-0 left-0 h-px"
        style={{
          background: "rgba(196, 106, 71, 0.3)",
          width: lettersOut ? "100%" : "0%",
          transition: "width 2s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      />
    </div>
  )
}
