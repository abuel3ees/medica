"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { DoctorSummary } from "@/types"
import { router } from "@inertiajs/react"
import { Search, TrendingDown, TrendingUp, Minus } from "lucide-react"
import { useState } from "react"

function getDifficultyColor(d: string) {
  if (d === "A") return "text-destructive"
  if (d === "B") return "text-primary"
  return "text-accent"
}

function TrendIcon({ trend }: { trend: string }) {
  if (trend === "improving") return <TrendingUp className="h-3 w-3 text-green-500" />
  if (trend === "declining") return <TrendingDown className="h-3 w-3 text-destructive" />
  return <Minus className="h-3 w-3 text-muted-foreground" />
}

export function DoctorList({
  doctors,
  selectedId,
}: {
  doctors: DoctorSummary[]
  selectedId?: number
}) {
  const [search, setSearch] = useState("")
  const filtered = doctors.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      (d.specialty?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (d.institution?.toLowerCase().includes(search.toLowerCase()) ?? false),
  )

  function selectDoctor(id: number) {
    router.visit("/doctors", {
      data: { doctor_id: id },
      preserveState: true,
      preserveScroll: true,
    })
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-foreground">All Physicians</CardTitle>
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search doctors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-input pl-9"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2 max-h-[600px] overflow-y-auto">
          {filtered.map((doc) => (
            <button
              key={doc.id}
              onClick={() => selectDoctor(doc.id)}
              className={cn(
                "flex items-center justify-between rounded-lg border border-transparent p-3 text-left transition-colors hover:border-border hover:bg-secondary/30",
                selectedId === doc.id && "border-primary/30 bg-secondary/50",
              )}
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{doc.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {doc.specialty}{doc.institution ? ` · ${doc.institution}` : ""}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 ml-3">
                <div className="flex items-center gap-1.5">
                  <span className={cn("font-mono text-xs font-medium capitalize", getDifficultyColor(doc.access_difficulty))}>
                    {doc.access_difficulty}
                  </span>
                  <TrendIcon trend={doc.trend ?? "stable"} />
                </div>
                <span className="font-mono text-[10px] text-muted-foreground">{doc.visits_count} visits</span>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">No doctors found</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
