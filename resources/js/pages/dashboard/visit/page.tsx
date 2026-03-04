import { EfficiencyPreview } from "@/components/dashboard/efficiency-preview"
import { VisitForm } from "@/components/dashboard/visit-form"
import type { VisitCreatePageProps, VisitFormData } from "@/types"
import { usePage } from "@inertiajs/react"
import { useState } from "react"
import DashboardLayout from "../layout"

export default function VisitPage() {
  const { doctors, objectives, objectionTags, doctorContext } =
    usePage<{ props: VisitCreatePageProps }>().props as unknown as VisitCreatePageProps

  const [formData, setFormData] = useState<VisitFormData>({
    doctor_profile_id: null,
    visit_type: "in_person",
    visit_date: new Date().toISOString().split("T")[0],
    objectives: [],
    engagement_quality: null,
    access_difficulty: null,
    time_spent_minutes: null,
    confidence: 75,
    stance_before: null,
    stance_after: null,
    notes: "",
    objection_tag_ids: [],
    next_step: null,
  })

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Log Doctor Visit</h1>
          <p className="text-sm text-muted-foreground">Record visit details for efficiency scoring</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <VisitForm
              doctors={doctors}
              objectives={objectives}
              objectionTags={objectionTags}
              onFormChange={setFormData}
            />
          </div>
          <EfficiencyPreview
            formData={formData}
            objectives={objectives}
            doctorContext={doctorContext}
          />
        </div>
      </div>
    </DashboardLayout>
  )
}
