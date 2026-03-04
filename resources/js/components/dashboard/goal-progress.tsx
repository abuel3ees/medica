import { Crosshair, Stethoscope, Target, ThumbsUp } from "lucide-react"

import { HelpTip } from "@/components/help-tip"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { GoalProgress as GoalProgressType } from "@/types"

function CircularGauge({
  value,
  max,
  label,
  color,
  icon: Icon,
  size = 100,
}: {
  value: number
  max: number
  label: string
  color: string
  icon: typeof Target
  size?: number
}) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  const radius = (size - 12) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (pct / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            className="text-muted/30"
            strokeWidth={5}
          />
          {/* Progress arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={5}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Icon className="h-3.5 w-3.5 text-muted-foreground mb-0.5" />
          <span className="font-mono text-base font-bold tabular-nums text-foreground leading-none">
            {value}
          </span>
          <span className="text-[8px] text-muted-foreground">/ {max}</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-[10px] font-semibold text-foreground">{label}</p>
        <p
          className={cn(
            "font-mono text-[10px] font-bold tabular-nums",
            pct >= 100 ? "text-emerald-600" : pct >= 60 ? "text-blue-600" : "text-amber-600",
          )}
        >
          {pct}%
        </p>
      </div>
    </div>
  )
}

export function GoalProgress({ data }: { data: GoalProgressType }) {
  const scoreTarget = 80
  const scorePct = Math.min(100, Math.round((data.avgScore / scoreTarget) * 100))

  return (
    <Card className="overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="border-b border-border/30 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent shadow-sm">
            <Crosshair className="h-3.5 w-3.5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <CardTitle className="text-sm font-bold text-foreground">Weekly Goals</CardTitle>
              <HelpTip
                content="Track your weekly progress against targets. Visit count, unique doctors seen, positive outcomes, and average efficiency score."
                side="right"
              />
            </div>
            <p className="text-[10px] text-muted-foreground">This week&apos;s progress</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-5 pb-4">
        <div className="grid grid-cols-4 gap-2">
          <CircularGauge
            value={data.weeklyVisits}
            max={data.weeklyTarget}
            label="Visits"
            color="#C46A47"
            icon={Target}
          />
          <CircularGauge
            value={data.uniqueDoctors}
            max={data.doctorTarget}
            label="Doctors"
            color="#5A8A6A"
            icon={Stethoscope}
          />
          <CircularGauge
            value={data.positiveOutcomes}
            max={data.positiveTarget}
            label="Positive"
            color="#10b981"
            icon={ThumbsUp}
          />
          <CircularGauge
            value={data.avgScore}
            max={scoreTarget}
            label="Efficiency"
            color={scorePct >= 80 ? "#10b981" : scorePct >= 50 ? "#3b82f6" : "#f59e0b"}
            icon={Crosshair}
          />
        </div>
      </CardContent>
    </Card>
  )
}
