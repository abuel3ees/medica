import * as React from "react"

import { cn } from "@/lib/utils"

// -----------------------------------------------------------
// Chart wrapper components for recharts
// -----------------------------------------------------------

type ChartConfig = Record<
  string,
  { label: string; color: string }
>

const ChartContext = React.createContext<{ config: ChartConfig }>({
  config: {},
})

function ChartContainer({
  config,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & { config: ChartConfig }) {
  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart-container"
        className={cn("w-full", className)}
        {...props}
      >
        {children}
      </div>
    </ChartContext.Provider>
  )
}

function ChartTooltip({
  content,
  ...props
}: {
  content?: React.ReactNode
  [key: string]: unknown
}) {
  // Re-export recharts Tooltip with custom content
  // We'll use recharts' Tooltip directly in the chart components
  const RechartsTooltip = React.lazy(
    () => import("recharts").then((mod) => ({ default: mod.Tooltip }))
  )

  return (
    <React.Suspense fallback={null}>
      <RechartsTooltip content={content as any} {...(props as any)} />
    </React.Suspense>
  )
}

function ChartTooltipContent({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
}) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-lg border border-border bg-background px-3 py-2 shadow-md">
      <p className="mb-1 text-xs font-medium text-foreground">{label}</p>
      {payload.map((entry, idx) => (
        <div key={idx} className="flex items-center gap-2 text-xs">
          <div
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-mono font-medium text-foreground">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

export { ChartContainer, ChartTooltip, ChartTooltipContent, ChartContext }
export type { ChartConfig }
