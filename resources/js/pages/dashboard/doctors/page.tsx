import { DoctorDetail } from "@/components/dashboard/doctor-detail"
import { DoctorList } from "@/components/dashboard/doctor-list"
import { Button } from "@/components/ui/button"
import type { DoctorsPageProps } from "@/types"
import { Link, usePage } from "@inertiajs/react"
import { Plus } from "lucide-react"
import DashboardLayout from "../layout"

export default function DoctorsPage() {
  const { doctors, selectedDoctor } =
    usePage<{ props: DoctorsPageProps }>().props as unknown as DoctorsPageProps

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Doctor Profiles</h1>
            <p className="text-sm text-muted-foreground">Physician engagement history, difficulty, and trends</p>
          </div>
          <Link href="/doctors/create">
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              Add Doctor
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <DoctorList doctors={doctors} selectedId={selectedDoctor?.id} />
          <div className="lg:col-span-2">
            {selectedDoctor ? (
              <DoctorDetail doctor={selectedDoctor} />
            ) : (
              <div className="flex items-center justify-center rounded-lg border border-dashed border-border p-12">
                <p className="text-sm text-muted-foreground">Select a doctor to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
