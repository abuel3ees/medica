import * as React from "react"

import { cn } from "@/lib/utils"

function Slider({
  className,
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  ...props
}: React.ComponentProps<"div"> & {
  value?: number[]
  onValueChange?: (value: number[]) => void
  min?: number
  max?: number
  step?: number
}) {
  const currentValue = value?.[0] ?? min

  const percentage = ((currentValue - min) / (max - min)) * 100

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onValueChange?.([Number(e.target.value)])
  }

  return (
    <div
      data-slot="slider"
      className={cn("relative flex w-full touch-none select-none items-center", className)}
      {...props}
    >
      <div className="bg-primary/20 relative h-1.5 w-full rounded-full">
        <div
          className="bg-primary absolute h-full rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={currentValue}
        onChange={handleChange}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      />
      <div
        className="bg-background border-primary/50 absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 shadow-sm transition-colors"
        style={{ left: `calc(${percentage}% - 8px)` }}
      />
    </div>
  )
}

export { Slider }
