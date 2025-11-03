"use client"

import { cn } from "@/lib/utils"
import { getStatusLabel, getStatusVariant } from "@/lib/utils/format"
import { Badge } from "@/components/ui/badge"
import { type VariantProps } from "class-variance-authority"

interface StatusBadgeProps {
  status: string
  variant?: VariantProps<typeof Badge>["variant"]
  className?: string
}

/**
 * Status badge with automatic variant and label
 */
export function StatusBadge({ status, variant, className }: StatusBadgeProps) {
  const badgeVariant = variant || getStatusVariant(status)
  const label = getStatusLabel(status)

  return (
    <Badge variant={badgeVariant as any} className={cn("capitalize", className)}>
      {label}
    </Badge>
  )
}
