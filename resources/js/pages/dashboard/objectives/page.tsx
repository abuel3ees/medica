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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { router, useForm, usePage } from "@inertiajs/react"
import { Edit2, Plus, Trash2 } from "lucide-react"
import { useState } from "react"
import DashboardLayout from "../layout"

type ObjectiveItem = {
  id: number
  name: string
  category: string | null
  importance: "high" | "standard" | "low"
  weight: number
  is_active: boolean
  usage_count: number
}

function importanceColor(i: string) {
  if (i === "high") return "bg-destructive/10 text-destructive border-destructive/30"
  if (i === "standard") return "bg-primary/10 text-primary border-primary/30"
  return "bg-muted text-muted-foreground border-border"
}

export default function ObjectivesPage() {
  const { objectives } = usePage<{ props: { objectives: ObjectiveItem[] } }>().props as unknown as {
    objectives: ObjectiveItem[]
  }

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  const { data, setData, post, put, processing, errors, reset } = useForm({
    name: "",
    category: "",
    importance: "standard" as "high" | "standard" | "low",
    weight: 1.0,
    is_active: true,
  })

  function openCreate() {
    reset()
    setEditingId(null)
    setShowForm(true)
  }

  function openEdit(obj: ObjectiveItem) {
    setData({
      name: obj.name,
      category: obj.category ?? "",
      importance: obj.importance,
      weight: obj.weight,
      is_active: obj.is_active,
    })
    setEditingId(obj.id)
    setShowForm(true)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (editingId) {
      put(`/objectives/${editingId}`, {
        onSuccess: () => {
          setShowForm(false)
          reset()
          setEditingId(null)
        },
      })
    } else {
      post("/objectives", {
        onSuccess: () => {
          setShowForm(false)
          reset()
        },
      })
    }
  }

  function handleDelete() {
    if (!deleteId) return
    setDeleting(true)
    router.delete(`/objectives/${deleteId}`, {
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
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Objectives</h1>
            <p className="text-sm text-muted-foreground">
              Manage visit objectives used for scoring
            </p>
          </div>
          <Button size="sm" className="gap-1.5" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            New Objective
          </Button>
        </div>

        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-foreground">
              {objectives.length} objective{objectives.length !== 1 ? "s" : ""}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {objectives.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="pb-3 text-xs font-medium text-muted-foreground">Name</th>
                      <th className="pb-3 text-xs font-medium text-muted-foreground">Category</th>
                      <th className="pb-3 text-xs font-medium text-muted-foreground">Importance</th>
                      <th className="pb-3 text-right text-xs font-medium text-muted-foreground">Weight</th>
                      <th className="pb-3 text-right text-xs font-medium text-muted-foreground">Used</th>
                      <th className="pb-3 text-center text-xs font-medium text-muted-foreground">Status</th>
                      <th className="pb-3 text-right text-xs font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {objectives.map((obj) => (
                      <tr
                        key={obj.id}
                        className={`border-b border-border/50 transition-colors hover:bg-secondary/30 ${
                          !obj.is_active ? "opacity-50" : ""
                        }`}
                      >
                        <td className="py-3 text-sm font-medium text-foreground">{obj.name}</td>
                        <td className="py-3 text-sm text-muted-foreground">{obj.category ?? "—"}</td>
                        <td className="py-3">
                          <Badge variant="outline" className={`text-[10px] capitalize ${importanceColor(obj.importance)}`}>
                            {obj.importance}
                          </Badge>
                        </td>
                        <td className="py-3 text-right font-mono text-sm text-foreground">
                          {obj.weight.toFixed(1)}
                        </td>
                        <td className="py-3 text-right font-mono text-xs text-muted-foreground">
                          {obj.usage_count} visit{obj.usage_count !== 1 ? "s" : ""}
                        </td>
                        <td className="py-3 text-center">
                          <Badge variant={obj.is_active ? "default" : "secondary"} className="text-[10px]">
                            {obj.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-primary"
                              onClick={() => openEdit(obj)}
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-destructive"
                              onClick={() => setDeleteId(obj.id)}
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
                <p className="text-sm text-muted-foreground">No objectives created yet.</p>
                <button onClick={openCreate} className="mt-2 text-sm text-primary hover:underline">
                  Create your first objective →
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create / Edit dialog */}
      <Dialog open={showForm} onOpenChange={(open) => { if (!open) { setShowForm(false); setEditingId(null); reset() } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Objective" : "New Objective"}</DialogTitle>
            <DialogDescription>
              {editingId
                ? "Update this objective's configuration."
                : "Add a new objective that reps can select during visit check-ins."}
            </DialogDescription>
          </DialogHeader>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <Label className="text-sm">Name</Label>
              <Input
                value={data.name}
                onChange={(e) => setData("name", e.target.value)}
                placeholder="e.g. Present clinical data"
                className="bg-input"
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-sm">Category</Label>
              <Input
                value={data.category}
                onChange={(e) => setData("category", e.target.value)}
                placeholder="e.g. Education, Sales, Compliance"
                className="bg-input"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label className="text-sm">Importance</Label>
                <Select value={data.importance} onValueChange={(v) => setData("importance", v as "high" | "standard" | "low")}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-sm">Weight</Label>
                <Input
                  type="number"
                  min={0.1}
                  max={5.0}
                  step={0.1}
                  value={data.weight}
                  onChange={(e) => setData("weight", Number(e.target.value))}
                  className="bg-input font-mono"
                />
                {errors.weight && <p className="text-xs text-destructive">{errors.weight}</p>}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Checkbox
                checked={data.is_active}
                onCheckedChange={(v) => setData("is_active", v === true)}
                id="is_active"
              />
              <Label htmlFor="is_active" className="text-sm">Active</Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingId(null); reset() }}>
                Cancel
              </Button>
              <Button type="submit" disabled={processing}>
                {processing
                  ? editingId ? "Saving..." : "Creating..."
                  : editingId ? "Save Changes" : "Create Objective"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this objective?</DialogTitle>
            <DialogDescription>
              If this objective has been used in visits, it will be deactivated instead of deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete Objective"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
