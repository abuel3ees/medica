import { VisitForm } from "@/components/dashboard/visit-form"
import type { VisitCreatePageProps, VisitFormData } from "@/types"
import { usePage } from "@inertiajs/react"
import { useState } from "react"
import DashboardLayout from "../layout"

type VisitEditPageProps = VisitCreatePageProps & {
  visit: VisitFormData & { id: number }
}

export default function VisitEditPage() {
  const { visit, doctors, objectives, objectionTags, doctorContext } =
    usePage<{ props: VisitEditPageProps }>().props as unknown as VisitEditPageProps

  const [formData, setFormData] = useState<VisitFormData>({
    doctor_profile_id: visit.doctor_profile_id,
    visit_type: visit.visit_type,
    visit_date: visit.visit_date,
    objectives: visit.objectives ?? [],
    engagement_quality: visit.engagement_quality,
    access_difficulty: visit.access_difficulty,
    time_spent_minutes: visit.time_spent_minutes,
    confidence: visit.confidence ?? 75,
    stance_before: visit.stance_before,
    stance_after: visit.stance_after,
    notes: visit.notes ?? "",
    objection_tag_ids: visit.objection_tag_ids ?? [],
    next_step: visit.next_step,
  })

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Edit Visit</h1>
          <p className="text-sm text-muted-foreground">Update visit details and re-calculate efficiency score</p>
        </div>

        <div className="lg:col-span-2">
          <VisitForm
            doctors={doctors}
            objectives={objectives}
            objectionTags={objectionTags}
            onFormChange={setFormData}
            editMode
            visitId={visit.id}
            initialData={visit}
          />
        </div>
      </div>
    </DashboardLayout>
  )
}
