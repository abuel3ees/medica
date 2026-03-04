import { DoctorDetail } from "@/components/dashboard/doctor-detail"
import type { DoctorDetail as DoctorDetailType } from "@/types"
import { usePage } from "@inertiajs/react"
import DashboardLayout from "../layout"

export default function DoctorShowPage() {
  const { doctor } = usePage<{ props: { doctor: DoctorDetailType } }>().props as unknown as {
    doctor: DoctorDetailType
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 p-6">
        <DoctorDetail doctor={doctor} />
      </div>
    </DashboardLayout>
  )
}
