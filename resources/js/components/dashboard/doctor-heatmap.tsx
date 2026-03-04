import { HelpTip } from "@/components/help-tip"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { HeatmapDay, TopDoctor } from "@/types"
import { Calendar, Star, Stethoscope } from "lucide-react"

function getHeatColor(level: number): string {
  const colors = [
    "bg-muted/40",
    "bg-primary/10",
    "bg-primary/25",
    "bg-primary/40",
    "bg-primary/60",
    "bg-primary/85",
  ]
  return colors[level] || colors[0]
}

export function DoctorHeatmap({
  heatmapData,
  topDoctors,
}: {
  heatmapData: HeatmapDay[]
  topDoctors: TopDoctor[]
}) {
  const maxCount = Math.max(...heatmapData.map((d) => d.count), 1)

  return (
    <Card className="overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="border-b border-border/30 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary shadow-sm">
            <Calendar className="h-3.5 w-3.5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <CardTitle className="text-sm font-bold text-foreground">Visit Heatmap</CardTitle>
              <HelpTip
                content="Shows visit distribution by day of week. Identify your busiest days and scheduling gaps. Top doctors are ranked by total visit frequency."
                side="right"
              />
            </div>
            <p className="text-[10px] text-muted-foreground">Doctor engagement by day of week</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {/* Weekly heatmap bars */}
        <div className="flex flex-col gap-1.5">
          {heatmapData.map((day) => (
            <div key={day.day} className="group flex items-center gap-3">
              <div className="w-8 shrink-0 text-right font-mono text-[10px] font-medium text-muted-foreground">
                {day.day}
              </div>
              <div className="relative flex flex-1 items-center">
                <div className="h-1 w-full rounded-full bg-muted/30" />
                <div
                  className={cn(
                    "absolute left-0 top-0 h-full rounded-full transition-all duration-500",
                    day.level >= 4
                      ? "bg-primary"
                      : day.level >= 2
                        ? "bg-primary/60"
                        : "bg-primary/25",
                  )}
                  style={{ width: `${Math.max(4, (day.count / maxCount) * 100)}%`, height: `${Math.max(4, 4 + day.level * 2)}px` }}
                />
              </div>
              <span className="w-6 text-right font-mono text-[10px] font-semibold text-foreground/60 tabular-nums group-hover:text-foreground">
                {day.count}
              </span>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-3 flex items-center justify-end gap-1.5">
          <span className="text-[9px] text-muted-foreground">Less</span>
          {[0, 1, 2, 3, 4, 5].map((level) => (
            <div
              key={level}
              className={cn("h-2.5 w-2.5 rounded-sm transition-transform hover:scale-125", getHeatColor(level))}
            />
          ))}
          <span className="text-[9px] text-muted-foreground">More</span>
        </div>

        {/* Top Doctors */}
        <div className="mt-5">
          <div className="mb-2 flex items-center gap-1.5">
            <Star className="h-3 w-3 text-amber-500" />
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Top Physicians</p>
          </div>
          <div className="flex flex-col gap-1.5">
            {topDoctors.map((doc, idx) => (
              <div
                key={doc.name}
                className="group flex items-center gap-3 rounded-lg border border-border/30 bg-background/50 px-3 py-2 transition-all duration-200 hover:border-primary/20 hover:bg-primary/5"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                  {idx + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-foreground">{doc.name}</p>
                  <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Stethoscope className="h-2.5 w-2.5" />
                    {doc.specialty}
                  </p>
                </div>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-bold tabular-nums text-primary">
                  {doc.visits}
                </span>
              </div>
            ))}
            {topDoctors.length === 0 && (
              <div className="flex flex-col items-center gap-1 py-4">
                <Stethoscope className="h-6 w-6 text-muted-foreground/20" />
                <p className="text-[10px] text-muted-foreground">No visit data yet.</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
