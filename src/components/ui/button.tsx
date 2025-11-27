import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: "default" | "secondary" | "ghost" | "outline" | "accent";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ... props }, ref) => {
    const Comp = asChild ?  Slot : "button";
    return (
      <Comp
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-brand disabled:pointer-events-none disabled:opacity-50",
          {
            // Variants
            "bg-accent-brand text-white hover:bg-accent-brand/90": variant === "default",
            "bg-background-surface2 text-text-primary hover:bg-background-surface2/80": variant === "secondary",
            "hover:bg-background-surface1 text-text-primary": variant === "ghost",
            "border border-border bg-transparent hover:bg-background-surface1": variant === "outline",
            "bg-accent-utility text-white hover:bg-accent-utility/90": variant === "accent",
            // Sizes
            "h-10 px-4 py-2 text-sm": size === "default",
            "h-8 px-3 text-xs": size === "sm",
            "h-12 px-6 text-base": size === "lg",
            "h-10 w-10": size === "icon",
          },
          className
        )}
        ref={ref}
        {... props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };