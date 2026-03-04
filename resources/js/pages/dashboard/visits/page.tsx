import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Link, router, usePage } from "@inertiajs/react"
import { Edit2, Plus, Trash2 } from "lucide-react"
import { useState } from "react"
import DashboardLayout from "../layout"

type VisitObjectiveItem = {
  name: string
  outcome: string
  score: number
}

type NextStepListItem = {
  description: string
  due_date: string | null
  is_completed: boolean
}

type VisitListItem = {
  id: number
  rep: string
  doctor: string
  specialty: string | null
  visit_type: string
  visit_date: string
  objectives: VisitObjectiveItem[]
  efficiency_score: number | null
  engagement_quality: string | null
  time_spent: string | null
  next_steps: NextStepListItem[]
}

type PaginatedVisits = {
  data: VisitListItem[]
  current_page: number
  last_page: number
  next_page_url: string | null
  prev_page_url: string | null
}

function outcomeColor(outcome: string) {
  if (outcome === "met") return "bg-green-500/10 text-green-600 border-green-200"
  if (outcome === "partially_met") return "bg-yellow-500/10 text-yellow-600 border-yellow-200"
  return "bg-red-500/10 text-red-600 border-red-200"
}

export default function VisitsPage() {
  const { visits } = usePage<{ props: { visits: PaginatedVisits } }>().props as unknown as {
    visits: PaginatedVisits
  }
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  function handleDelete() {
    if (!deleteId) return
    setDeleting(true)
    router.delete(`/visits/${deleteId}`, {
      onFinish: () => {
        setDeleting(false)
        setDeleteId(null)
      },
    })
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Visit Log</h1>
            <p className="text-sm text-muted-foreground">All recorded doctor visits</p>
          </div>
          <Link href="/visits/create">
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              New Visit
            </Button>
          </Link>
        </div>

        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-foreground">
              {visits.data.length > 0 ? `Page ${visits.current_page} of ${visits.last_page}` : "No visits yet"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {visits.data.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="pb-3 text-xs font-medium text-muted-foreground">Date</th>
                      <th className="pb-3 text-xs font-medium text-muted-foreground">Doctor</th>
                      <th className="pb-3 text-xs font-medium text-muted-foreground">Type</th>
                      <th className="pb-3 text-xs font-medium text-muted-foreground">Objectives</th>
                      <th className="pb-3 text-right text-xs font-medium text-muted-foreground">Score</th>
                      <th className="pb-3 text-right text-xs font-medium text-muted-foreground">Time</th>
                      <th className="pb-3 text-right text-xs font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visits.data.map((visit) => (
                      <tr key={visit.id} className="border-b border-border/50 transition-colors hover:bg-secondary/30">
                        <td className="py-3 font-mono text-xs text-foreground">{visit.visit_date}</td>
                        <td className="py-3">
                          <p className="text-sm text-foreground">{visit.doctor}</p>
                          <p className="text-xs text-muted-foreground">{visit.specialty}</p>
                        </td>
                        <td className="py-3">
                          <Badge variant="outline" className="text-[10px] capitalize">
                            {visit.visit_type.replace("_", " ")}
                          </Badge>
                        </td>
                        <td className="py-3">
                          <div className="flex flex-wrap gap-1">
                            {visit.objectives.map((obj, i) => (
                              <Badge key={i} variant="outline" className={`text-[10px] ${outcomeColor(obj.outcome)}`}>
                                {obj.name}: {obj.outcome.replace("_", " ")}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 text-right">
                          {visit.efficiency_score != null ? (
                            <Badge
                              variant={Number(visit.efficiency_score) >= 0.7 ? "default" : "secondary"}
                              className="font-mono tabular-nums"
                            >
                              {Number(visit.efficiency_score).toFixed(2)}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="py-3 text-right font-mono text-xs text-muted-foreground">
                          {visit.time_spent ?? "—"}
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link href={`/visits/${visit.id}/edit`}>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary">
                                <Edit2 className="h-3.5 w-3.5" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-destructive"
                              onClick={() => setDeleteId(visit.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center">
                <p className="text-sm text-muted-foreground">No visits recorded yet.</p>
                <Link href="/visits/create" className="mt-2 inline-block text-sm text-primary hover:underline">
                  Log your first visit →
                </Link>
              </div>
            )}

            {/* Pagination */}
            {visits.last_page > 1 && (
              <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                {visits.prev_page_url ? (
                  <Link href={visits.prev_page_url} className="text-sm text-primary hover:underline">
                    ← Previous
                  </Link>
                ) : (
                  <span />
                )}
                <span className="text-xs text-muted-foreground">
                  Page {visits.current_page} of {visits.last_page}
                </span>
                {visits.next_page_url ? (
                  <Link href={visits.next_page_url} className="text-sm text-primary hover:underline">
                    Next →
                  </Link>
                ) : (
                  <span />
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this visit?</DialogTitle>
            <DialogDescription>
              This will soft-delete the visit record. This action can be reversed by an admin.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete visit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
