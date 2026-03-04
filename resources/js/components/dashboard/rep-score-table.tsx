import { ArrowDown, ArrowUp, Crown, Minus, Users } from "lucide-react"

import { HelpTip } from "@/components/help-tip"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { RepScore } from "@/types"

function getTrendIcon(trend: "up" | "down" | "flat") {
  if (trend === "up") return <ArrowUp className="h-3 w-3" />
  if (trend === "down") return <ArrowDown className="h-3 w-3" />
  return <Minus className="h-3 w-3" />
}

function scoreColor(score: number) {
  if (score >= 85) return "bg-emerald-500/15 text-emerald-600 border-emerald-500/30"
  if (score >= 70) return "bg-blue-500/15 text-blue-600 border-blue-500/30"
  if (score >= 55) return "bg-amber-500/15 text-amber-600 border-amber-500/30"
  return "bg-red-500/15 text-red-600 border-red-500/30"
}

function rankBadge(idx: number) {
  if (idx === 0)
    return (
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white shadow-sm">
        <Crown className="h-3 w-3" />
      </div>
    )
  if (idx === 1)
    return (
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-400 text-[10px] font-bold text-white">
        2
      </div>
    )
  if (idx === 2)
    return (
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-700 text-[10px] font-bold text-white">
        3
      </div>
    )
  return (
    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground">
      {idx + 1}
    </div>
  )
}

export function RepScoreTable({ reps }: { reps: RepScore[] }) {
  return (
    <Card className="overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="border-b border-border/30 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary shadow-sm">
            <Users className="h-3.5 w-3.5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <CardTitle className="text-sm font-bold text-foreground">Rep Leaderboard</CardTitle>
              <HelpTip
                content="Ranked by efficiency score: (Weighted Outcome + Progress Bonus) × Difficulty ÷ Time. Segment A doctors count 1.5× more. Scores update after each visit."
                side="right"
              />
            </div>
            <p className="text-[10px] text-muted-foreground">Efficiency formula: O × W × D / T</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/30 bg-muted/20">
                <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Rank</th>
                <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Rep</th>
                <th className="px-4 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Score</th>
                <th className="px-4 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Visits</th>
                <th className="px-4 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Trend</th>
              </tr>
            </thead>
            <tbody>
              {reps.map((rep, idx) => (
                <tr
                  key={rep.name}
                  className={cn(
                    "group border-b border-border/20 transition-all duration-200 hover:bg-primary/5",
                    idx === 0 && "bg-amber-500/5",
                  )}
                >
                  <td className="px-4 py-3">{rankBadge(idx)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/12 text-[10px] font-bold text-primary">
                        {rep.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </div>
                      <p className="text-sm font-medium text-foreground">{rep.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Badge
                      variant="outline"
                      className={cn("font-mono text-xs tabular-nums", scoreColor(rep.score))}
                    >
                      {rep.score}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-mono text-sm tabular-nums text-foreground">{rep.visits}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div
                      className={cn(
                        "flex items-center justify-end gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                        rep.trend === "up" && "text-emerald-600",
                        rep.trend === "down" && "text-red-500",
                        rep.trend === "flat" && "text-muted-foreground",
                      )}
                    >
                      {getTrendIcon(rep.trend)}
                      <span className="font-mono tabular-nums">
                        {rep.change > 0 ? "+" : ""}
                        {rep.change}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
              {reps.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-sm text-muted-foreground">
                    No rep data available yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
