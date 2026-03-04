import { HelpTip } from "@/components/help-tip"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { RecentVisit } from "@/types"
import { Activity, Clock } from "lucide-react"

function outcomeDot(outcome: string) {
  if (outcome === "Positive") return "bg-emerald-500"
  if (outcome === "Negative") return "bg-red-500"
  return "bg-amber-500"
}

function outcomeBadgeClass(outcome: string) {
  if (outcome === "Positive") return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
  if (outcome === "Negative") return "bg-red-500/10 text-red-600 border-red-500/20"
  return "bg-amber-500/10 text-amber-600 border-amber-500/20"
}

export function RecentVisits({ visits }: { visits: RecentVisit[] }) {
  return (
    <Card className="overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="border-b border-border/30 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent shadow-sm">
            <Activity className="h-3.5 w-3.5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <CardTitle className="text-sm font-bold text-foreground">Recent Visits</CardTitle>
              <HelpTip
                content="Latest logged visits. Green = Positive outcome, Amber = Neutral, Red = Negative. The score bar shows each visit's efficiency score out of 1.0."
                side="left"
              />
            </div>
            <p className="text-[10px] text-muted-foreground">Live feed from field reps</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-medium text-emerald-600">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3">
        <div className="flex flex-col gap-2">
          {visits.map((visit, idx) => (
            <div
              key={`${visit.doctor}-${idx}`}
              className="group relative overflow-hidden rounded-xl border border-border/30 bg-background/50 p-3 transition-all duration-300 hover:border-primary/20 hover:bg-primary/5 hover:shadow-sm"
            >
              {/* Left accent bar */}
              <div className={cn("absolute left-0 top-0 h-full w-0.5", outcomeDot(visit.outcome))} />

              <div className="flex items-start justify-between pl-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{visit.doctor}</p>
                  <p className="text-[11px] text-muted-foreground">{visit.specialty}</p>
                </div>
                <Badge variant="outline" className={cn("shrink-0 text-[10px]", outcomeBadgeClass(visit.outcome))}>
                  {visit.outcome}
                </Badge>
              </div>

              <div className="mt-2 flex items-center justify-between pl-2">
                <span className="text-[11px] text-muted-foreground">
                  by <span className="font-medium text-foreground/70">{visit.rep}</span>
                </span>
                <div className="flex items-center gap-1 text-muted-foreground/60">
                  <Clock className="h-2.5 w-2.5" />
                  <span className="font-mono text-[10px]">{visit.time}</span>
                </div>
              </div>

              {visit.score !== null && (
                <div className="mt-1.5 pl-2">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted/50">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          (visit.score ?? 0) >= 0.7 ? "bg-emerald-500" : (visit.score ?? 0) >= 0.5 ? "bg-amber-500" : "bg-red-500",
                        )}
                        style={{ width: `${Math.min(100, (visit.score ?? 0) * 100)}%` }}
                      />
                    </div>
                    <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
                      {((visit.score ?? 0) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
          {visits.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <Activity className="h-8 w-8 text-muted-foreground/20" />
              <p className="text-xs text-muted-foreground">No visits recorded yet.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
