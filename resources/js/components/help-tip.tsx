import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { HelpCircle } from "lucide-react"

interface HelpTipProps {
  content: string
  side?: "top" | "right" | "bottom" | "left"
  className?: string
  iconClassName?: string
}

/**
 * A small `?` icon that shows a tooltip with help text on hover.
 * Drop this next to any label, header, or value that needs explanation.
 */
export function HelpTip({ content, side = "top", className, iconClassName }: HelpTipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center justify-center rounded-full p-0.5 text-muted-foreground/60 transition-colors hover:text-primary focus:outline-none focus-visible:ring-1 focus-visible:ring-primary",
            className,
          )}
          aria-label="Help"
        >
          <HelpCircle className={cn("h-3.5 w-3.5", iconClassName)} />
        </button>
      </TooltipTrigger>
      <TooltipContent
        side={side}
        className="max-w-[260px] text-xs leading-relaxed"
      >
        {content}
      </TooltipContent>
    </Tooltip>
  )
}
