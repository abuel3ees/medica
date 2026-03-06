"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { DoctorContext, VisitFormData, Objective } from "@/types"

function computePreviewScore(data: VisitFormData, objectives: Objective[], doctorContext: DoctorContext | null): number {
  if (data.objectives.length === 0) return 0

  // Weighted outcome
  let totalWeightedScore = 0
  let totalWeight = 0
  for (const vo of data.objectives) {
    const obj = objectives.find((o) => o.id === vo.objective_id)
    const weight = obj?.weight ?? 1.0
    const outcomeScore = vo.outcome === "met" ? 1.0 : vo.outcome === "partially_met" ? 0.5 : 0.0
    totalWeightedScore += outcomeScore * weight
    totalWeight += weight
  }
  const rawOutcome = totalWeight > 0 ? totalWeightedScore / totalWeight : 0

  // Difficulty multiplier
  const diffMult =
    data.access_difficulty === "C" ? 0.9 : data.access_difficulty === "A" ? 1.15 : 1.0

  // Time factor (new: Met=1, On Progress=1.41, Exceeded=2)
  const timeFactor = data.time_goal_status === "exceeded" ? 2.0
    : data.time_goal_status === "on_progress" ? 1.41
    : 1.0

  // Confidence is now always x1
  const confAdj = 1.0

  // Cross-functional bonus: +1.0 when doctor needs it
  const crossFunctionalBonus = doctorContext?.needs_cross_functional_support ? 1.0 : 0

  return Number((((rawOutcome * diffMult / timeFactor) * confAdj) + crossFunctionalBonus).toFixed(3))
}

export function EfficiencyPreview({
  formData,
  objectives,
  doctorContext,
}: {
  formData: VisitFormData
  objectives: Objective[]
  doctorContext: DoctorContext | null
}) {
  const previewScore = computePreviewScore(formData, objectives, doctorContext)

  return (
    <div className="flex flex-col gap-4">
      {/* Formula breakdown */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-foreground">Live Calculation</CardTitle>
          <p className="text-xs text-muted-foreground">Preview based on current inputs</p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="overflow-hidden rounded-lg border border-border bg-secondary/30 p-4 font-mono text-xs">
              <p className="mb-3 text-muted-foreground">// Scoring Engine</p>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Objectives</span>
                  <span className="text-foreground">{formData.objectives.length} selected</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Time Goal</span>
                  <span className="text-foreground capitalize">{formData.time_goal_status ? formData.time_goal_status.replace("_", " ") : "—"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Time Factor</span>
                  <span className="text-foreground font-mono">
                    ×{formData.time_goal_status === "exceeded" ? "2.0" : formData.time_goal_status === "on_progress" ? "1.41" : "1.0"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Access Difficulty</span>
                  <span className="text-foreground">{formData.access_difficulty ?? "B"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Time Spent</span>
                  <span className="text-foreground">{formData.time_spent_minutes ?? "—"}m</span>
                </div>
                {doctorContext?.needs_cross_functional_support && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Cross-Functional</span>
                    <span className="font-semibold text-green-500">+1.0 bonus</span>
                  </div>
                )}
                <div className="mt-2 border-t border-border pt-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">Efficiency Score</span>
                    <span className="text-lg font-bold text-primary">{previewScore.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Formula explanation */}
            <div className="rounded-md bg-secondary/20 px-3 py-2 text-[10px] text-muted-foreground">
              <p>Score = (Σ(Outcome × Weight) / ΣWeight + Bonus) × DifficultyMult ÷ TimeFactor + CrossFunctional</p>
              <p className="mt-1">Time: Met=×1 · On Progress=×1.41 · Exceeded=×2 · Cross-Functional=+1</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Doctor quick info */}
      {doctorContext && (
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-foreground">Doctor Context</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Difficulty</span>
                <Badge variant="outline" className="font-mono capitalize text-accent">
                  {doctorContext.difficulty}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Stance</span>
                <Badge variant="outline" className="font-mono capitalize">
                  {doctorContext.stance}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Last visit</span>
                <span className="font-mono text-xs text-foreground">{doctorContext.last_visit ?? "Never"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Visit count</span>
                <span className="font-mono text-xs text-foreground">{doctorContext.visit_count}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Avg score</span>
                <span className="font-mono text-xs text-primary">{doctorContext.avg_score.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Trend</span>
                <span className="font-mono text-xs capitalize text-accent">{doctorContext.trend}</span>
              </div>
              {doctorContext.open_loops > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Open loops</span>
                  <Badge variant="destructive" className="font-mono text-[10px]">
                    {doctorContext.open_loops} pending
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
