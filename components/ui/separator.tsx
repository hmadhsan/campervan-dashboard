import type * as React from "react"
import { cn } from "@/lib/utils"

interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical"
}

export function Separator({ className, orientation = "horizontal", ...props }: SeparatorProps) {
  return (
    <div
      className={cn("bg-gray-200", orientation === "horizontal" ? "h-px w-full" : "h-full w-px", className)}
      {...props}
    />
  )
}
