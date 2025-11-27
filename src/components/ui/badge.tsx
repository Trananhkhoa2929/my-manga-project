import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "hot" | "new" | "update" | "completed";
}
const variantClasses: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "bg-accent-brand text-white",
  hot: "bg-accent-hot text-white animate-pulse-slow",
  new: "bg-blue-500 text-white",
  update: "bg-accent-brand text-white",
  completed: "bg-green-600 text-white",
};

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold transition-colors",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };