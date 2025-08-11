
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-green-600 text-white hover:bg-green-600/80", // Entregue
        secondary:
          "border-transparent bg-blue-600 text-white hover:bg-blue-600/80", // A caminho
        destructive:
          "border-transparent bg-red-600 text-destructive-foreground hover:bg-red-600/80", // Cancelado
        outline: "text-foreground", // Default/Em separação
        warning: 
          "border-transparent bg-orange-500 text-white hover:bg-orange-500/80", // Aprovado
      },
    },
    defaultVariants: {
      variant: "outline",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
