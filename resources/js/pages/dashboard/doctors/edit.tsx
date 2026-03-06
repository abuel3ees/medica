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
  access_difficulty: "A" | "B" | "C"
  license_number: string | null
  years_of_experience: number | null
  bio: string | null
  needs_cross_functional_support: boolean
  cross_functional_departments: string | null
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
    needs_cross_functional_support: doctor.needs_cross_functional_support ?? false,
    cross_functional_departments: doctor.cross_functional_departments ?? "",
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
                  <Select value={data.access_difficulty} onValueChange={(v) => setData("access_difficulty", v as "A" | "B" | "C")}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">A — Hard Access</SelectItem>
                      <SelectItem value="B">B — Moderate</SelectItem>
                      <SelectItem value="C">C — Easy Access</SelectItem>
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

              {/* Cross-Functional Support */}
              <div className="flex flex-col gap-3 rounded-lg border border-border bg-secondary/10 p-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="cross_functional"
                    checked={data.needs_cross_functional_support}
                    onChange={(e) => {
                      setData("needs_cross_functional_support", e.target.checked)
                      if (!e.target.checked) setData("cross_functional_departments", "")
                    }}
                    className="h-4 w-4 rounded border-border accent-primary"
                  />
                  <Label htmlFor="cross_functional" className="text-sm font-medium cursor-pointer">
                    Needs Cross-Functional Support
                  </Label>
                </div>
                {data.needs_cross_functional_support && (
                  <div className="flex flex-col gap-2 pl-7">
                    <Label className="text-xs text-muted-foreground">Select Departments</Label>
                    <div className="flex gap-2">
                      {(["Marketing", "Medical", "Access"] as const).map((dept) => {
                        const selected = (data.cross_functional_departments || "").split(",").filter(Boolean)
                        const isSelected = selected.includes(dept.toLowerCase())
                        return (
                          <button
                            key={dept}
                            type="button"
                            className={`flex-1 rounded-md border px-3 py-2 text-xs font-medium transition-colors ${
                              isSelected
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border text-muted-foreground hover:bg-secondary/50"
                            }`}
                            onClick={() => {
                              const current = (data.cross_functional_departments || "").split(",").filter(Boolean)
                              const updated = isSelected
                                ? current.filter((d) => d !== dept.toLowerCase())
                                : [...current, dept.toLowerCase()]
                              setData("cross_functional_departments", updated.join(","))
                            }}
                          >
                            {dept}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
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
