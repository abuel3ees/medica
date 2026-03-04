"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { DoctorDetail as DoctorDetailType } from "@/types"
import { Link, router } from "@inertiajs/react"
import { CalendarPlus, Edit2, Trash2 } from "lucide-react"
import { useState } from "react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

const primaryColor = "#C46A47"

function stanceColor(s: string) {
  if (s === "supportive") return "text-green-500"
  if (s === "resistant") return "text-destructive"
  return "text-muted-foreground"
}

export function DoctorDetail({ doctor }: { doctor: DoctorDetailType }) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleting, setDeleting] = useState(false)

  function handleDelete() {
    setDeleting(true)
    router.delete(`/doctors/${doctor.id}`, {
      onFinish: () => {
        setDeleting(false)
        setShowDeleteDialog(false)
      },
    })
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Doctor header */}
      <Card className="border-border bg-card">
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 font-mono text-xl font-bold text-primary">
              {doctor.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">{doctor.name}</h2>
              <p className="text-sm text-muted-foreground">
                {doctor.specialty}
                {doctor.institution ? ` · ${doctor.institution}` : ""}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="flex flex-col items-center rounded-lg border border-border bg-secondary/50 px-4 py-2">
              <span className="font-mono text-lg font-bold text-primary">{doctor.visits_count}</span>
              <span className="text-[10px] text-muted-foreground">Total visits</span>
            </div>
            <div className="flex flex-col items-center rounded-lg border border-border bg-secondary/50 px-4 py-2">
              <span className={`font-mono text-lg font-bold capitalize ${doctor.access_difficulty === "hard" ? "text-destructive" : doctor.access_difficulty === "moderate" ? "text-primary" : "text-accent"}`}>
                {doctor.access_difficulty}
              </span>
              <span className="text-[10px] text-muted-foreground">Access</span>
            </div>
            <div className="flex flex-col items-center rounded-lg border border-border bg-secondary/50 px-4 py-2">
              <span className={`font-mono text-lg font-bold capitalize ${stanceColor(doctor.stance)}`}>
                {doctor.stance}
              </span>
              <span className="text-[10px] text-muted-foreground">Stance</span>
            </div>
            <div className="flex flex-col items-center rounded-lg border border-border bg-secondary/50 px-4 py-2">
              <span className="font-mono text-lg font-bold text-accent">{doctor.avg_score.toFixed(2)}</span>
              <span className="text-[10px] text-muted-foreground">Avg score</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-2">
        <Link href={`/visits/create?doctor_id=${doctor.id}`}>
          <Button size="sm" className="gap-1.5">
            <CalendarPlus className="h-4 w-4" />
            Log Visit
          </Button>
        </Link>
        <Link href={`/doctors/${doctor.id}/edit`}>
          <Button size="sm" variant="outline" className="gap-1.5">
            <Edit2 className="h-4 w-4" />
            Edit
          </Button>
        </Link>
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => setShowDeleteDialog(true)}
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
      </div>

      {/* Trend chart + Open Loops */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-foreground">Score Trend</CardTitle>
            <p className="text-xs text-muted-foreground">Efficiency progression over recent visits</p>
          </CardHeader>
          <CardContent>
            {doctor.trend_data.length > 0 ? (
              <ChartContainer
                config={{ score: { label: "Efficiency", color: primaryColor } }}
                className="h-[200px] w-full"
              >
                <LineChart data={doctor.trend_data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                  <XAxis dataKey="label" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 1]} tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke={primaryColor}
                    strokeWidth={2}
                    dot={{ fill: primaryColor, r: 3 }}
                    name="Efficiency"
                  />
                </LineChart>
              </ChartContainer>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">No visit data yet</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-foreground">Open Loops</CardTitle>
            <p className="text-xs text-muted-foreground">Pending next steps from previous visits</p>
          </CardHeader>
          <CardContent>
            {doctor.open_loops.length > 0 ? (
              <div className="flex flex-col gap-3">
                {doctor.open_loops.map((loop) => (
                  <div key={loop.id} className="flex items-start justify-between rounded-lg border border-border p-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-foreground">{loop.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {loop.type} · Due: {loop.due_date ?? "No date"}
                      </p>
                    </div>
                    {loop.is_overdue && (
                      <Badge variant="destructive" className="ml-2 text-[10px]">Overdue</Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">No open loops — all caught up!</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Visit History */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-foreground">Visit History</CardTitle>
        </CardHeader>
        <CardContent>
          {doctor.visit_history.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-3 text-xs font-medium text-muted-foreground">Date</th>
                    <th className="pb-3 text-xs font-medium text-muted-foreground">Rep</th>
                    <th className="pb-3 text-xs font-medium text-muted-foreground">Type</th>
                    <th className="pb-3 text-xs font-medium text-muted-foreground">Objectives</th>
                    <th className="pb-3 text-right text-xs font-medium text-muted-foreground">Score</th>
                    <th className="pb-3 text-right text-xs font-medium text-muted-foreground">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {doctor.visit_history.map((h) => (
                    <tr key={h.id} className="border-b border-border/50 transition-colors hover:bg-secondary/30">
                      <td className="py-3 font-mono text-xs text-foreground">{h.date}</td>
                      <td className="py-3 text-sm text-muted-foreground">{h.rep}</td>
                      <td className="py-3">
                        <Badge variant="outline" className="text-[10px] capitalize">{h.type}</Badge>
                      </td>
                      <td className="py-3 text-sm text-muted-foreground">{h.objectives_summary}</td>
                      <td className="py-3 text-right">
                        <Badge variant={h.score >= 0.7 ? "default" : "secondary"} className="font-mono tabular-nums">
                          {h.score.toFixed(2)}
                        </Badge>
                      </td>
                      <td className="py-3 text-right font-mono text-xs text-muted-foreground">{h.time_spent}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">No visits recorded yet</p>
          )}
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {doctor.name}?</DialogTitle>
            <DialogDescription>
              This will soft-delete this doctor profile. Their visit history will be preserved.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete Doctor"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
