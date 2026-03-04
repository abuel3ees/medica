"use client"

import { useForm } from "@inertiajs/react"
import {
  CheckCircle2,
  ChevronDown,
  Minus,
  Plus,
  X,
} from "lucide-react"
import { useState, useEffect } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import type {
  DoctorSummary,
  Objective,
  ObjectionTag,
  VisitFormData,
  VisitObjectiveInput,
} from "@/types"

const VISIT_TYPES = [
  { value: "in_person", label: "In-Person" },
  { value: "call", label: "Call" },
  { value: "event", label: "Event" },
  { value: "follow_up", label: "Follow-Up" },
]

const NEXT_STEP_TYPES = [
  "Send study",
  "Book CME",
  "Bring KOL",
  "Schedule follow-up",
  "Deliver samples",
  "Share case study",
  "Arrange meeting",
]

export function VisitForm({
  doctors,
  objectives,
  objectionTags,
  onDoctorChange,
  onFormChange,
  editMode = false,
  visitId,
  initialData,
}: {
  doctors: DoctorSummary[]
  objectives: Objective[]
  objectionTags: ObjectionTag[]
  onDoctorChange?: (doctorId: number) => void
  onFormChange?: (data: VisitFormData) => void
  editMode?: boolean
  visitId?: number
  initialData?: Partial<VisitFormData>
}) {
  const [submitted, setSubmitted] = useState(false)
  const [doctorSearch, setDoctorSearch] = useState(() => {
    if (initialData?.doctor_profile_id) {
      const doc = doctors.find((d) => d.id === initialData.doctor_profile_id)
      return doc?.name ?? ""
    }
    return ""
  })
  const [showSignals, setShowSignals] = useState(!!initialData?.engagement_quality || !!initialData?.access_difficulty || !!initialData?.time_spent_minutes)
  const [showNextStep, setShowNextStep] = useState(!!initialData?.next_step)

  const { data, setData, post, put, processing, errors, reset } = useForm<VisitFormData>({
    doctor_profile_id: initialData?.doctor_profile_id ?? null,
    visit_type: initialData?.visit_type ?? "in_person",
    visit_date: initialData?.visit_date ?? new Date().toISOString().split("T")[0],
    objectives: initialData?.objectives ?? [],
    engagement_quality: initialData?.engagement_quality ?? null,
    access_difficulty: initialData?.access_difficulty ?? null,
    time_spent_minutes: initialData?.time_spent_minutes ?? null,
    confidence: initialData?.confidence ?? null,
    stance_before: initialData?.stance_before ?? null,
    stance_after: initialData?.stance_after ?? null,
    notes: initialData?.notes ?? "",
    objection_tag_ids: initialData?.objection_tag_ids ?? [],
    next_step: initialData?.next_step ?? null,
  })

  // Sync form data to parent for live efficiency preview
  useEffect(() => {
    onFormChange?.(data)
  }, [data])

  const filteredDoctors = doctors.filter(
    (d) =>
      d.name.toLowerCase().includes(doctorSearch.toLowerCase()) ||
      (d.specialty?.toLowerCase().includes(doctorSearch.toLowerCase()) ?? false)
  )

  const selectedDoctor = doctors.find((d) => d.id === data.doctor_profile_id)

  // Add objective to visit
  const addObjective = (objectiveId: number) => {
    if (data.objectives.length >= 3) return
    if (data.objectives.some((o) => o.objective_id === objectiveId)) return

    setData("objectives", [
      ...data.objectives,
      { objective_id: objectiveId, outcome: "met" as const },
    ])
  }

  // Remove objective
  const removeObjective = (objectiveId: number) => {
    setData(
      "objectives",
      data.objectives.filter((o) => o.objective_id !== objectiveId)
    )
  }

  // Update objective outcome
  const updateOutcome = (objectiveId: number, outcome: VisitObjectiveInput["outcome"]) => {
    setData(
      "objectives",
      data.objectives.map((o) =>
        o.objective_id === objectiveId ? { ...o, outcome } : o
      )
    )
  }

  // Toggle objection tag
  const toggleObjectionTag = (tagId: number) => {
    setData(
      "objection_tag_ids",
      data.objection_tag_ids.includes(tagId)
        ? data.objection_tag_ids.filter((id) => id !== tagId)
        : [...data.objection_tag_ids, tagId]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editMode && visitId) {
      put(`/visits/${visitId}`, {
        onSuccess: () => {
          setSubmitted(true)
        },
      })
    } else {
      post("/visits", {
        onSuccess: () => {
          setSubmitted(true)
        },
      })
    }
  }

  if (submitted) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="flex flex-col items-center gap-4 py-16">
          <CheckCircle2 className="h-12 w-12 text-accent" />
          <h3 className="text-lg font-semibold text-foreground">
            {editMode ? "Visit updated successfully" : "Visit logged successfully"}
          </h3>
          <p className="text-sm text-muted-foreground">Efficiency score will update in the dashboard shortly.</p>
          <Button
            variant="outline"
            onClick={() => {
              setSubmitted(false)
              reset()
            }}
            className="mt-2"
          >
            Log another visit
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold text-foreground">Visit Check-In</CardTitle>
        <p className="text-xs text-muted-foreground">30–60 seconds · structured for scoring</p>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          {/* Doctor search */}
          <div className="flex flex-col gap-2">
            <Label className="text-sm text-foreground">Doctor</Label>
            <div className="relative">
              <Input
                placeholder="Search doctors..."
                value={doctorSearch}
                onChange={(e) => setDoctorSearch(e.target.value)}
                className="bg-input"
              />
              {doctorSearch && filteredDoctors.length > 0 && !selectedDoctor && (
                <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-border bg-popover shadow-md">
                  {filteredDoctors.slice(0, 6).map((doc) => (
                    <button
                      key={doc.id}
                      type="button"
                      className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-secondary/50"
                      onClick={() => {
                        setData("doctor_profile_id", doc.id)
                        setData("stance_before", doc.stance)
                        setDoctorSearch(doc.name)
                        onDoctorChange?.(doc.id)
                      }}
                    >
                      <div>
                        <span className="font-medium text-foreground">{doc.name}</span>
                        <span className="ml-2 text-xs text-muted-foreground">{doc.specialty}</span>
                      </div>
                      <Badge variant="outline" className="text-[10px]">{doc.segment}</Badge>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {selectedDoctor && (
              <div className="flex items-center gap-2 rounded-md bg-secondary/30 px-3 py-2">
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{selectedDoctor.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedDoctor.specialty} · {selectedDoctor.institution} · Tier {selectedDoctor.segment}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => {
                    setData("doctor_profile_id", null)
                    setDoctorSearch("")
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
            {errors.doctor_profile_id && (
              <p className="text-xs text-destructive">{errors.doctor_profile_id}</p>
            )}
          </div>

          {/* Visit type + date */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label className="text-sm text-foreground">Visit Type</Label>
              <Select
                value={data.visit_type}
                onValueChange={(val) => setData("visit_type", val as VisitFormData["visit_type"])}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VISIT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-sm text-foreground">Visit Date</Label>
              <Input
                type="date"
                value={data.visit_date}
                onChange={(e) => setData("visit_date", e.target.value)}
                className="bg-input font-mono"
              />
            </div>
          </div>

          {/* Objectives (1-3) */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm text-foreground">Objectives (1-3)</Label>
              <span className="text-xs text-muted-foreground">{data.objectives.length}/3 selected</span>
            </div>

            {/* Selected objectives with outcome */}
            {data.objectives.map((vo) => {
              const obj = objectives.find((o) => o.id === vo.objective_id)
              if (!obj) return null
              return (
                <div key={vo.objective_id} className="rounded-lg border border-border bg-secondary/20 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{obj.name}</span>
                      <Badge variant="outline" className="text-[10px]">
                        {obj.importance}
                      </Badge>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      onClick={() => removeObjective(vo.objective_id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  {/* Outcome buttons */}
                  <div className="flex gap-2">
                    {([
                      { value: "met", label: "✅ Met", color: "bg-green-500/10 text-green-700 border-green-500/30" },
                      { value: "partially_met", label: "🟡 Partial", color: "bg-yellow-500/10 text-yellow-700 border-yellow-500/30" },
                      { value: "not_met", label: "❌ Not met", color: "bg-red-500/10 text-red-700 border-red-500/30" },
                    ] as const).map((outcome) => (
                      <button
                        key={outcome.value}
                        type="button"
                        className={`flex-1 rounded-md border px-2 py-1.5 text-xs font-medium transition-colors ${
                          vo.outcome === outcome.value
                            ? outcome.color
                            : "border-border bg-background text-muted-foreground hover:bg-secondary/50"
                        }`}
                        onClick={() => updateOutcome(vo.objective_id, outcome.value)}
                      >
                        {outcome.label}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}

            {/* Add objective */}
            {data.objectives.length < 3 && (
              <Select onValueChange={(val) => addObjective(Number(val))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="+ Add objective" />
                </SelectTrigger>
                <SelectContent>
                  {objectives
                    .filter((o) => !data.objectives.some((vo) => vo.objective_id === o.id))
                    .map((obj) => (
                      <SelectItem key={obj.id} value={String(obj.id)}>
                        <span>{obj.name}</span>
                        <span className="ml-2 text-xs text-muted-foreground">({obj.importance})</span>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            )}
            {errors.objectives && (
              <p className="text-xs text-destructive">{errors.objectives}</p>
            )}
          </div>

          {/* Confidence slider */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm text-foreground">Confidence</Label>
              <span className="font-mono text-sm font-bold tabular-nums text-primary">
                {data.confidence ?? 75}%
              </span>
            </div>
            <Slider
              value={[data.confidence ?? 75]}
              onValueChange={([val]) => setData("confidence", val)}
              min={0}
              max={100}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Not sure at all</span>
              <span>Very confident</span>
            </div>
          </div>

          {/* Stance tracking */}
          {selectedDoctor && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label className="text-sm text-foreground">Stance Before</Label>
                <Select
                  value={data.stance_before ?? ""}
                  onValueChange={(val) => setData("stance_before", val as VisitFormData["stance_before"])}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Current stance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="supportive">Supportive</SelectItem>
                    <SelectItem value="neutral">Neutral</SelectItem>
                    <SelectItem value="resistant">Resistant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-sm text-foreground">Stance After</Label>
                <Select
                  value={data.stance_after ?? ""}
                  onValueChange={(val) => setData("stance_after", val as VisitFormData["stance_after"])}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="After visit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="supportive">Supportive</SelectItem>
                    <SelectItem value="neutral">Neutral</SelectItem>
                    <SelectItem value="resistant">Resistant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Optional signals toggle */}
          <button
            type="button"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            onClick={() => setShowSignals(!showSignals)}
          >
            <ChevronDown className={`h-4 w-4 transition-transform ${showSignals ? "rotate-180" : ""}`} />
            Quick signals (optional)
          </button>

          {showSignals && (
            <div className="flex flex-col gap-4 rounded-lg border border-border bg-secondary/10 p-4">
              {/* Engagement quality */}
              <div className="flex flex-col gap-2">
                <Label className="text-xs text-muted-foreground">Engagement Quality</Label>
                <div className="flex gap-2">
                  {(["low", "medium", "high"] as const).map((level) => (
                    <button
                      key={level}
                      type="button"
                      className={`flex-1 rounded-md border px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                        data.engagement_quality === level
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:bg-secondary/50"
                      }`}
                      onClick={() =>
                        setData("engagement_quality", data.engagement_quality === level ? null : level)
                      }
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Access difficulty */}
              <div className="flex flex-col gap-2">
                <Label className="text-xs text-muted-foreground">Access Difficulty</Label>
                <div className="flex gap-2">
                  {(["A", "B", "C"] as const).map((level) => (
                    <button
                      key={level}
                      type="button"
                      className={`flex-1 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                        data.access_difficulty === level
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:bg-secondary/50"
                      }`}
                      onClick={() =>
                        setData("access_difficulty", data.access_difficulty === level ? null : level)
                      }
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time spent */}
              <div className="flex flex-col gap-2">
                <Label className="text-xs text-muted-foreground">Time Spent (minutes)</Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() =>
                      setData("time_spent_minutes", Math.max(5, (data.time_spent_minutes ?? 15) - 5))
                    }
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <Input
                    type="number"
                    min={1}
                    max={480}
                    value={data.time_spent_minutes ?? ""}
                    onChange={(e) => setData("time_spent_minutes", e.target.value ? Number(e.target.value) : null)}
                    className="w-20 bg-input text-center font-mono"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() =>
                      setData("time_spent_minutes", Math.min(480, (data.time_spent_minutes ?? 15) + 5))
                    }
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                  <span className="text-xs text-muted-foreground">min</span>
                </div>
              </div>

              {/* Objection tags */}
              <div className="flex flex-col gap-2">
                <Label className="text-xs text-muted-foreground">Objection Tags</Label>
                <div className="flex flex-wrap gap-1.5">
                  {objectionTags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                        data.objection_tag_ids.includes(tag.id)
                          ? "border-destructive/30 bg-destructive/10 text-destructive"
                          : "border-border text-muted-foreground hover:bg-secondary/50"
                      }`}
                      onClick={() => toggleObjectionTag(tag.id)}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="flex flex-col gap-2">
            <Label className="text-sm text-foreground">Notes (optional)</Label>
            <Textarea
              placeholder="Key discussion points, follow-up items..."
              rows={3}
              value={data.notes}
              onChange={(e) => setData("notes", e.target.value)}
              className="resize-none bg-input"
            />
          </div>

          {/* Next step */}
          <button
            type="button"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            onClick={() => {
              setShowNextStep(!showNextStep)
              if (!showNextStep && !data.next_step) {
                setData("next_step", { description: "", type: null, due_date: null })
              }
            }}
          >
            <ChevronDown className={`h-4 w-4 transition-transform ${showNextStep ? "rotate-180" : ""}`} />
            Add next step
          </button>

          {showNextStep && data.next_step && (
            <div className="flex flex-col gap-3 rounded-lg border border-border bg-secondary/10 p-4">
              <div className="flex flex-col gap-2">
                <Label className="text-xs text-muted-foreground">Next Step</Label>
                <Input
                  placeholder="e.g., Send study summary, Book CME..."
                  value={data.next_step.description}
                  onChange={(e) =>
                    setData("next_step", { ...data.next_step!, description: e.target.value })
                  }
                  className="bg-input"
                />
                <div className="flex flex-wrap gap-1.5">
                  {NEXT_STEP_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                        data.next_step?.description === type
                          ? "border-primary/30 bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:bg-secondary/50"
                      }`}
                      onClick={() =>
                        setData("next_step", {
                          ...data.next_step!,
                          description: type,
                          type: type.toLowerCase().replace(/\s/g, "_"),
                        })
                      }
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-xs text-muted-foreground">Due Date</Label>
                <Input
                  type="date"
                  value={data.next_step.due_date ?? ""}
                  onChange={(e) =>
                    setData("next_step", { ...data.next_step!, due_date: e.target.value || null })
                  }
                  className="w-48 bg-input font-mono"
                />
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={processing || data.objectives.length === 0 || !data.doctor_profile_id}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {processing ? (editMode ? "Updating..." : "Submitting...") : (editMode ? "Update visit" : "Submit visit")}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
