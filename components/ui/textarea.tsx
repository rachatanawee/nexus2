import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-[hsl(var(--color-input))] bg-[hsl(var(--color-background))] px-3 py-2 text-sm ring-offset-[hsl(var(--color-background))] placeholder:text-[hsl(var(--color-muted-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-ring))] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
