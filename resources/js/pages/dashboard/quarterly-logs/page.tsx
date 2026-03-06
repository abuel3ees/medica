import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { router, usePage } from "@inertiajs/react"
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Eye,
  Filter,
  MessageSquare,
} from "lucide-react"
import { useState } from "react"
import DashboardLayout from "../layout"

interface LogEntry {
  id: number
  user: string
  user_role: string | null
  action: string
  subject_type: string | null
  subject_id: number | null
  subject_name: string | null
  priority: string
  quarter: string
  details: Record<string, unknown> | null
  reviewed: boolean
  reviewed_by: string | null
  reviewed_at: string | null
  review_notes: string | null
  created_at: string
  created_at_raw: string
}

interface Props {
  logs: { data: LogEntry[]; links: unknown[]; current_page: number; last_page: number }
  currentQuarter: string
  availableQuarters: string[]
  stats: { total: number; unreviewed: number; critical: number; high: number }
  filters: { priority: string | null; reviewed: string | null }
}

const priorityConfig: Record<string, { color: string; icon: typeof AlertTriangle; label: string }> = {
  critical: { color: "bg-red-500/10 text-red-600 border-red-500/30", icon: AlertTriangle, label: "Critical" },
  high: { color: "bg-orange-500/10 text-orange-600 border-orange-500/30", icon: ChevronUp, label: "High" },
  normal: { color: "bg-blue-500/10 text-blue-600 border-blue-500/30", icon: Clock, label: "Normal" },
  low: { color: "bg-gray-500/10 text-gray-500 border-gray-500/30", icon: ChevronDown, label: "Low" },
}

const actionLabels: Record<string, string> = {
  visit_created: "Visit Logged",
  visit_updated: "Visit Updated",
  visit_deleted: "Visit Deleted",
  doctor_created: "Doctor Added",
  doctor_updated: "Doctor Updated",
  doctor_deleted: "Doctor Deleted",
  medication_created: "Medication Added",
  medication_updated: "Medication Updated",
  medication_deleted: "Medication Deleted",
  objective_created: "Objective Created",
  objective_updated: "Objective Updated",
  objective_deleted: "Objective Deleted",
}

export default function QuarterlyLogsPage() {
  const { logs, currentQuarter, availableQuarters, stats, filters } = usePage<{ props: Props }>().props as unknown as Props
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [reviewNotes, setReviewNotes] = useState("")
  const [reviewingId, setReviewingId] = useState<number | null>(null)
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  const markReviewed = async (logId: number) => {
    const token = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content
    const res = await fetch(`/quarterly-logs/${logId}/review`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "X-CSRF-TOKEN": token ?? "", "X-Requested-With": "XMLHttpRequest", Accept: "application/json" },
      body: JSON.stringify({ notes: reviewNotes }),
    })
    if (res.ok) {
      setReviewingId(null)
      setReviewNotes("")
      router.reload({ only: ["logs", "stats"] })
    }
  }

  const bulkReview = async () => {
    if (selectedIds.length === 0) return
    const token = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content
    const res = await fetch("/quarterly-logs/bulk-review", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-CSRF-TOKEN": token ?? "", "X-Requested-With": "XMLHttpRequest", Accept: "application/json" },
      body: JSON.stringify({ ids: selectedIds }),
    })
    if (res.ok) {
      setSelectedIds([])
      router.reload({ only: ["logs", "stats"] })
    }
  }

  const navigate = (params: Record<string, string | null>) => {
    const url = new URL(window.location.href)
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.set(key, value)
      else url.searchParams.delete(key)
    })
    router.visit(url.toString(), { preserveState: true })
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 p-6">
        {/* Header */}
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Quarterly Logs</h1>
            <p className="text-sm text-muted-foreground">Review activity logs by quarter — track all rep actions</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={currentQuarter} onValueChange={(v) => navigate({ quarter: v })}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableQuarters.map((q) => (
                  <SelectItem key={q} value={q}>{q}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-3 sm:grid-cols-4">
          <Card className="border-border bg-card">
            <CardContent className="p-4 text-center">
              <p className="font-mono text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Logs</p>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="p-4 text-center">
              <p className="font-mono text-2xl font-bold text-orange-500">{stats.unreviewed}</p>
              <p className="text-xs text-muted-foreground">Pending Review</p>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="p-4 text-center">
              <p className="font-mono text-2xl font-bold text-red-500">{stats.critical}</p>
              <p className="text-xs text-muted-foreground">Critical</p>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="p-4 text-center">
              <p className="font-mono text-2xl font-bold text-primary">{stats.high}</p>
              <p className="text-xs text-muted-foreground">High Priority</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-border bg-card">
          <CardContent className="flex flex-wrap items-center gap-3 p-4">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filters.priority ?? "all"} onValueChange={(v) => navigate({ priority: v === "all" ? null : v })}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.reviewed ?? "all"} onValueChange={(v) => navigate({ reviewed: v === "all" ? null : v })}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="no">Pending</SelectItem>
                <SelectItem value="yes">Reviewed</SelectItem>
              </SelectContent>
            </Select>
            {selectedIds.length > 0 && (
              <Button size="sm" onClick={bulkReview} className="ml-auto gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Review Selected ({selectedIds.length})
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Log entries */}
        <div className="flex flex-col gap-2">
          {logs.data.length === 0 ? (
            <Card className="border-border bg-card">
              <CardContent className="flex flex-col items-center gap-3 py-12">
                <Eye className="h-8 w-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">No logs for this quarter yet</p>
              </CardContent>
            </Card>
          ) : (
            logs.data.map((log) => {
              const pc = priorityConfig[log.priority] || priorityConfig.normal
              const PriorityIcon = pc.icon
              const isExpanded = expandedId === log.id
              const isReviewing = reviewingId === log.id
              const isSelected = selectedIds.includes(log.id)

              return (
                <Card
                  key={log.id}
                  className={`border-border bg-card transition-colors ${log.reviewed ? "opacity-70" : ""} ${isSelected ? "ring-1 ring-primary" : ""}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Checkbox */}
                      {!log.reviewed && (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            setSelectedIds(e.target.checked
                              ? [...selectedIds, log.id]
                              : selectedIds.filter((id) => id !== log.id))
                          }}
                          className="mt-1 h-4 w-4 rounded border-border accent-primary"
                        />
                      )}

                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className={`text-[10px] ${pc.color}`}>
                            <PriorityIcon className="mr-1 h-3 w-3" />
                            {pc.label}
                          </Badge>
                          <span className="text-sm font-medium text-foreground">
                            {actionLabels[log.action] || log.action}
                          </span>
                          {log.subject_name && (
                            <span className="text-sm text-muted-foreground">— {log.subject_name}</span>
                          )}
                          {log.reviewed && (
                            <Badge variant="outline" className="text-[10px] bg-green-500/10 text-green-600 border-green-500/30">
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                              Reviewed
                            </Badge>
                          )}
                        </div>
                        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{log.user}</span>
                          <span>·</span>
                          <span>{log.created_at}</span>
                          {log.subject_type && (
                            <>
                              <span>·</span>
                              <span>{log.subject_type} #{log.subject_id}</span>
                            </>
                          )}
                        </div>

                        {/* Expanded details */}
                        {isExpanded && log.details && (
                          <div className="mt-3 rounded-md bg-secondary/30 p-3 font-mono text-xs text-muted-foreground">
                            <pre className="whitespace-pre-wrap">{JSON.stringify(log.details, null, 2)}</pre>
                          </div>
                        )}

                        {/* Review notes display */}
                        {log.reviewed && log.review_notes && (
                          <div className="mt-2 flex items-start gap-2 rounded-md bg-green-500/5 px-3 py-2 text-xs">
                            <MessageSquare className="mt-0.5 h-3 w-3 text-green-600" />
                            <div>
                              <span className="font-medium text-green-600">Review note:</span>{" "}
                              <span className="text-muted-foreground">{log.review_notes}</span>
                              <span className="ml-2 text-muted-foreground/60">— {log.reviewed_by}, {log.reviewed_at}</span>
                            </div>
                          </div>
                        )}

                        {/* Review input */}
                        {isReviewing && (
                          <div className="mt-3 flex items-center gap-2">
                            <Input
                              placeholder="Review notes (optional)..."
                              value={reviewNotes}
                              onChange={(e) => setReviewNotes(e.target.value)}
                              className="h-8 bg-input text-xs"
                            />
                            <Button size="sm" className="h-8" onClick={() => markReviewed(log.id)}>
                              Confirm
                            </Button>
                            <Button size="sm" variant="ghost" className="h-8" onClick={() => { setReviewingId(null); setReviewNotes("") }}>
                              Cancel
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        {log.details && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => setExpandedId(isExpanded ? null : log.id)}
                          >
                            {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                          </Button>
                        )}
                        {!log.reviewed && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-green-600 hover:text-green-700"
                            onClick={() => setReviewingId(isReviewing ? null : log.id)}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>

        {/* Pagination */}
        {logs.last_page > 1 && (
          <div className="flex items-center justify-center gap-2">
            {Array.from({ length: logs.last_page }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                size="sm"
                variant={page === logs.current_page ? "default" : "outline"}
                onClick={() => navigate({ page: String(page) })}
              >
                {page}
              </Button>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
