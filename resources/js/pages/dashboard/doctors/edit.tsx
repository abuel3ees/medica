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
import { Textarea } from "@/components/ui/textarea"
import { useForm, usePage } from "@inertiajs/react"
import DashboardLayout from "../layout"

type DoctorEditData = {
  id: number
  name: string
  email: string
  specialty: string
  institution: string | null
  location: string | null
  segment: "A" | "B" | "C"
  stance: "supportive" | "neutral" | "resistant"
  access_difficulty: "easy" | "moderate" | "hard"
  license_number: string | null
  years_of_experience: number | null
  bio: string | null
}

export default function DoctorEditPage() {
  const { doctor } = usePage<{ props: { doctor: DoctorEditData } }>().props as unknown as {
    doctor: DoctorEditData
  }

  const { data, setData, put, processing, errors } = useForm({
    name: doctor.name,
    email: doctor.email,
    specialty: doctor.specialty,
    institution: doctor.institution ?? "",
    location: doctor.location ?? "",
    segment: doctor.segment,
    stance: doctor.stance,
    access_difficulty: doctor.access_difficulty,
    license_number: doctor.license_number ?? "",
    years_of_experience: doctor.years_of_experience ?? ("" as string | number),
    bio: doctor.bio ?? "",
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    put(`/doctors/${doctor.id}`)
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Edit Doctor</h1>
          <p className="text-sm text-muted-foreground">Update physician profile for Dr. {doctor.name}</p>
        </div>

        <Card className="max-w-2xl border-border bg-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold text-foreground">Doctor Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label className="text-sm">Full Name</Label>
                  <Input
                    value={data.name}
                    onChange={(e) => setData("name", e.target.value)}
                    className="bg-input"
                  />
                  {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-sm">Email</Label>
                  <Input
                    type="email"
                    value={data.email}
                    onChange={(e) => setData("email", e.target.value)}
                    className="bg-input"
                  />
                  {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label className="text-sm">Specialty</Label>
                  <Input
                    value={data.specialty}
                    onChange={(e) => setData("specialty", e.target.value)}
                    className="bg-input"
                  />
                  {errors.specialty && <p className="text-xs text-destructive">{errors.specialty}</p>}
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-sm">Institution</Label>
                  <Input
                    value={data.institution}
                    onChange={(e) => setData("institution", e.target.value)}
                    className="bg-input"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label className="text-sm">Location</Label>
                  <Input
                    value={data.location}
                    onChange={(e) => setData("location", e.target.value)}
                    className="bg-input"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-sm">License Number</Label>
                  <Input
                    value={data.license_number}
                    onChange={(e) => setData("license_number", e.target.value)}
                    className="bg-input"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="flex flex-col gap-2">
                  <Label className="text-sm">Segment (Tier)</Label>
                  <Select value={data.segment} onValueChange={(v) => setData("segment", v as "A" | "B" | "C")}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">A — High Priority</SelectItem>
                      <SelectItem value="B">B — Standard</SelectItem>
                      <SelectItem value="C">C — Low Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-sm">Current Stance</Label>
                  <Select value={data.stance} onValueChange={(v) => setData("stance", v as "supportive" | "neutral" | "resistant")}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="supportive">Supportive</SelectItem>
                      <SelectItem value="neutral">Neutral</SelectItem>
                      <SelectItem value="resistant">Resistant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-sm">Access Difficulty</Label>
                  <Select value={data.access_difficulty} onValueChange={(v) => setData("access_difficulty", v as "easy" | "moderate" | "hard")}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label className="text-sm">Years of Experience</Label>
                  <Input
                    type="number"
                    min={0}
                    max={60}
                    value={data.years_of_experience}
                    onChange={(e) => setData("years_of_experience", e.target.value ? Number(e.target.value) : "")}
                    className="bg-input"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-sm">Bio / Notes</Label>
                <Textarea
                  value={data.bio}
                  onChange={(e) => setData("bio", e.target.value)}
                  rows={3}
                  className="resize-none bg-input"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={processing}>
                  {processing ? "Saving..." : "Save Changes"}
                </Button>
                <Button type="button" variant="outline" onClick={() => window.history.back()}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
