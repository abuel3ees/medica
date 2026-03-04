import { usePage, useForm } from "@inertiajs/react"
import {
  FileText,
  Pill,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react"
import { useState } from "react"
import DashboardLayout from "../layout"

interface Medication {
  id: number
  name: string
  generic_name: string | null
  description: string | null
  indications: string | null
  dosage: string | null
  side_effects: string | null
  contraindications: string | null
  has_pdf: boolean
  uploaded_by: string | null
  created_at: string
}

interface Props {
  medications: Medication[]
}

export default function MedicationsPage() {
  const { medications } = usePage<{ props: Props }>().props as unknown as Props
  const [showAdd, setShowAdd] = useState(false)
  const [search, setSearch] = useState("")
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const { data, setData, post, processing, errors, reset } = useForm({
    name: "",
    generic_name: "",
    description: "",
    indications: "",
    dosage: "",
    side_effects: "",
    contraindications: "",
    pdf: null as File | null,
  })

  const filtered = medications.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      (m.generic_name?.toLowerCase().includes(search.toLowerCase()) ?? false)
  )

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append("name", data.name)
    if (data.generic_name) formData.append("generic_name", data.generic_name)
    if (data.description) formData.append("description", data.description)
    if (data.indications) formData.append("indications", data.indications)
    if (data.dosage) formData.append("dosage", data.dosage)
    if (data.side_effects) formData.append("side_effects", data.side_effects)
    if (data.contraindications) formData.append("contraindications", data.contraindications)
    if (data.pdf) formData.append("pdf", data.pdf)

    post("/medications", {
      forceFormData: true,
      onSuccess: () => {
        reset()
        setShowAdd(false)
      },
    })
  }

  const deleteMed = (id: number) => {
    if (!confirm("Delete this medication?")) return
    const token = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content
    fetch(`/medications/${id}`, {
      method: "DELETE",
      headers: { "X-CSRF-TOKEN": token ?? "", Accept: "application/json", "X-Inertia": "true" },
    }).then(() => window.location.reload())
  }

  return (
    <DashboardLayout>
      <div className="flex flex-1 flex-col gap-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Medications</h1>
            <p className="text-sm text-muted-foreground">
              Manage medication references — import PDFs, the AI coach will reference them
            </p>
          </div>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Add Medication
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search medications..."
            className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {/* Add Form */}
        {showAdd && (
          <form onSubmit={submit} className="rounded-xl border border-border bg-card p-5 animate-fade-in-up">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
              <Pill className="h-4 w-4 text-primary" />
              Add New Medication
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Name *</label>
                <input
                  type="text"
                  value={data.name}
                  onChange={(e) => setData("name", e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  required
                />
                {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Generic Name</label>
                <input
                  type="text"
                  value={data.generic_name}
                  onChange={(e) => setData("generic_name", e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Description</label>
                <textarea
                  value={data.description}
                  onChange={(e) => setData("description", e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  rows={2}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Indications</label>
                <textarea
                  value={data.indications}
                  onChange={(e) => setData("indications", e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  rows={2}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Dosage</label>
                <textarea
                  value={data.dosage}
                  onChange={(e) => setData("dosage", e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  rows={2}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Side Effects</label>
                <textarea
                  value={data.side_effects}
                  onChange={(e) => setData("side_effects", e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  rows={2}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Contraindications</label>
                <textarea
                  value={data.contraindications}
                  onChange={(e) => setData("contraindications", e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  rows={2}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">PDF Document (optional)</label>
                <div className="flex items-center gap-3">
                  <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary">
                    <Upload className="h-4 w-4" />
                    {data.pdf ? data.pdf.name : "Choose PDF file"}
                    <input
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={(e) => setData("pdf", e.target.files?.[0] ?? null)}
                    />
                  </label>
                  {data.pdf && (
                    <button type="button" onClick={() => setData("pdf", null)} className="text-muted-foreground hover:text-destructive">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button type="submit" disabled={processing} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                {processing ? "Saving..." : "Save Medication"}
              </button>
              <button type="button" onClick={() => setShowAdd(false)} className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground">
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Medications List */}
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-border/50 bg-card p-12 text-center">
            <Pill className="mx-auto h-10 w-10 text-muted-foreground/30" />
            <p className="mt-3 text-sm text-muted-foreground">No medications found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((med) => (
              <div key={med.id} className="rounded-xl border border-border/50 bg-card transition-all hover:shadow-sm">
                <div
                  className="flex cursor-pointer items-center justify-between p-4"
                  onClick={() => setExpandedId(expandedId === med.id ? null : med.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Pill className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-foreground">{med.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {med.generic_name && <span>{med.generic_name} · </span>}
                        {med.has_pdf && <span className="text-accent">PDF attached · </span>}
                        Added {med.created_at}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {med.has_pdf && <FileText className="h-4 w-4 text-accent" />}
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteMed(med.id) }}
                      className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {expandedId === med.id && (
                  <div className="border-t border-border/50 px-4 py-3 text-sm animate-fade-in">
                    <div className="grid gap-3 sm:grid-cols-2">
                      {med.description && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">Description</p>
                          <p className="mt-0.5 text-foreground">{med.description}</p>
                        </div>
                      )}
                      {med.indications && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">Indications</p>
                          <p className="mt-0.5 text-foreground">{med.indications}</p>
                        </div>
                      )}
                      {med.dosage && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">Dosage</p>
                          <p className="mt-0.5 text-foreground">{med.dosage}</p>
                        </div>
                      )}
                      {med.side_effects && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">Side Effects</p>
                          <p className="mt-0.5 text-foreground">{med.side_effects}</p>
                        </div>
                      )}
                      {med.contraindications && (
                        <div className="sm:col-span-2">
                          <p className="text-xs font-medium text-muted-foreground">Contraindications</p>
                          <p className="mt-0.5 text-foreground">{med.contraindications}</p>
                        </div>
                      )}
                      {med.uploaded_by && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">Uploaded by</p>
                          <p className="mt-0.5 text-foreground">{med.uploaded_by}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
