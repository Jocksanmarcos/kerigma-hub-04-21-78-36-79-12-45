import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-kerigma text-sm font-semibold ring-offset-background transition-[colors,transform,shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:-translate-y-0.5 hover:shadow-kerigma-md disabled:pointer-events-none disabled:opacity-50 active:translate-y-0 active:shadow-kerigma min-h-touch min-w-touch [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-kerigma hover:bg-primary/90 hover:shadow-kerigma-md",
        destructive: "bg-error text-error-foreground shadow-kerigma hover:bg-error/90",
        outline: "border border-border bg-background hover:bg-accent hover:text-accent-foreground shadow-kerigma",
        secondary: "bg-secondary text-secondary-foreground shadow-kerigma hover:bg-secondary/90 hover:shadow-kerigma-md",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        premium: "bg-kerigma-gradient text-white shadow-kerigma-lg hover:shadow-kerigma-xl",
        success: "bg-success text-success-foreground shadow-kerigma hover:bg-success/90",
        warning: "bg-warning text-warning-foreground shadow-kerigma hover:bg-warning/90",
        info: "bg-info text-info-foreground shadow-kerigma hover:bg-info/90",
        soft: "bg-muted text-muted-foreground hover:bg-muted/80",
        "outline-primary": "border-2 border-primary text-primary bg-transparent hover:bg-primary hover:text-primary-foreground",
        "outline-secondary": "border-2 border-secondary text-secondary bg-transparent hover:bg-secondary hover:text-secondary-foreground",
      },
      size: {
        default: "h-10 px-4 py-2 text-responsive-sm",
        sm: "h-8 px-3 py-1 text-responsive-xs",
        lg: "h-12 px-6 py-3 text-responsive-base",
        xl: "h-14 px-8 py-4 text-responsive-lg",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
