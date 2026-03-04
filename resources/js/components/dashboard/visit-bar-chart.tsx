import { BarChart3 } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { HelpTip } from "@/components/help-tip"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { DailyVisitBar } from "@/types"

const primaryHex = "#C46A47"

export function VisitBarChart({ data }: { data: DailyVisitBar[] }) {
  const totalVisits = data.reduce((sum, d) => sum + d.visits, 0)
  const avgPerDay = data.length > 0 ? (totalVisits / data.length).toFixed(1) : "0"

  return (
    <Card className="overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="border-b border-border/30 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary shadow-sm">
              <BarChart3 className="h-3.5 w-3.5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <CardTitle className="text-sm font-bold text-foreground">Daily Activity</CardTitle>
                <HelpTip
                  content="Visit volume over the last 14 days. Helps identify consistency patterns and peak days."
                  side="right"
                />
              </div>
              <p className="text-[10px] text-muted-foreground">Last 14 days visit volume</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-0.5">
            <span className="font-mono text-lg font-bold tabular-nums text-foreground">{totalVisits}</span>
            <span className="text-[9px] text-muted-foreground">~{avgPerDay}/day</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <ChartContainer
          config={{
            visits: { label: "Visits", color: primaryHex },
          }}
          className="h-50 w-full"
        >
          <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="fillBar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={primaryHex} stopOpacity={0.9} />
                <stop offset="100%" stopColor={primaryHex} stopOpacity={0.4} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
            <XAxis
              dataKey="day"
              tick={{ fill: "#9ca3af", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#9ca3af", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <ChartTooltip
              content={<ChartTooltipContent />}
            />
            <Bar
              dataKey="visits"
              fill="url(#fillBar)"
              radius={[4, 4, 0, 0]}
              name="Visits"
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
