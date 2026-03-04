import { PieChart as PieIcon } from "lucide-react"
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts"

import { HelpTip } from "@/components/help-tip"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { OutcomeSlice } from "@/types"

export function OutcomeChart({ data }: { data: OutcomeSlice[] }) {
  const total = data.reduce((sum, d) => sum + d.value, 0)

  return (
    <Card className="overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="border-b border-border/30 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary shadow-sm">
            <PieIcon className="h-3.5 w-3.5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <CardTitle className="text-sm font-bold text-foreground">Outcome Distribution</CardTitle>
              <HelpTip
                content="Breakdown of visit outcomes. Positive = majority of objectives met, Negative = majority not met, Neutral = balanced."
                side="right"
              />
            </div>
            <p className="text-[10px] text-muted-foreground">Visit results breakdown</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex items-center gap-4">
          {/* Donut chart */}
          <div className="relative h-40 w-40 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={72}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {data.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono text-2xl font-bold tabular-nums text-foreground">{total}</span>
              <span className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground">Total</span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-1 flex-col gap-3">
            {data.map((entry) => {
              const pct = total > 0 ? Math.round((entry.value / total) * 100) : 0
              return (
                <div key={entry.name} className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-foreground">{entry.name}</span>
                      <span className="font-mono text-xs font-bold tabular-nums text-foreground">{entry.value}</span>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted/40">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, backgroundColor: entry.color }}
                      />
                    </div>
                  </div>
                  <span className="font-mono text-[10px] tabular-nums text-muted-foreground w-8 text-right">{pct}%</span>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
