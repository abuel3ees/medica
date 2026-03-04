import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts"

import { HelpTip } from "@/components/help-tip"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { EfficiencyTrendPoint, VisitTrendPoint } from "@/types"
import { TrendingUp } from "lucide-react"

const primaryColor = "oklch(0.58 0.14 45)"
const accentColor = "oklch(0.62 0.12 145)"
const primaryHex = "#C46A47"
const accentHex = "#5A8A6A"

export function TrendCharts({
  efficiencyData,
  visitData,
}: {
  efficiencyData: EfficiencyTrendPoint[]
  visitData: VisitTrendPoint[]
}) {
  return (
    <Card className="overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="border-b border-border/30 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary shadow-sm">
            <TrendingUp className="h-3.5 w-3.5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <CardTitle className="text-sm font-bold text-foreground">Performance Trends</CardTitle>
              <HelpTip
                content="Efficiency tracks your score over time. Visit volume shows logging consistency. Look for upward efficiency trends and steady visit cadence."
                side="right"
              />
            </div>
            <p className="text-[10px] text-muted-foreground">Efficiency & visit metrics over time</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <Tabs defaultValue="efficiency" className="w-full">
          <TabsList className="mb-4 grid w-full grid-cols-2 rounded-lg bg-muted/50 p-0.5">
            <TabsTrigger value="efficiency" className="rounded-md text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm">
              Efficiency
            </TabsTrigger>
            <TabsTrigger value="visits" className="rounded-md text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm">
              Visits
            </TabsTrigger>
          </TabsList>

          <TabsContent value="efficiency">
            <ChartContainer
              config={{
                avg: { label: "Team Average", color: primaryColor },
                top: { label: "Top Performer", color: accentColor },
              }}
              className="h-[280px] w-full"
            >
              <AreaChart data={efficiencyData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillAvg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={primaryHex} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={primaryHex} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="fillTop" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={accentHex} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={accentHex} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
                <XAxis dataKey="month" tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="avg" stroke={primaryHex} fill="url(#fillAvg)" strokeWidth={2.5} name="Team Average" />
                <Area type="monotone" dataKey="top" stroke={accentHex} fill="url(#fillTop)" strokeWidth={2.5} name="Top Performer" />
              </AreaChart>
            </ChartContainer>
          </TabsContent>

          <TabsContent value="visits">
            <ChartContainer
              config={{
                visits: { label: "Total Visits", color: primaryColor },
                outcomes: { label: "Positive Outcomes", color: accentColor },
              }}
              className="h-[280px] w-full"
            >
              <AreaChart data={visitData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillVisits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={primaryHex} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={primaryHex} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="fillOutcomes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={accentHex} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={accentHex} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
                <XAxis dataKey="month" tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="visits" stroke={primaryHex} fill="url(#fillVisits)" strokeWidth={2.5} name="Total Visits" />
                <Area type="monotone" dataKey="outcomes" stroke={accentHex} fill="url(#fillOutcomes)" strokeWidth={2.5} name="Positive Outcomes" />
              </AreaChart>
            </ChartContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
