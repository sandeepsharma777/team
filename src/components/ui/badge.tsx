import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-slate-900 text-slate-50 hover:bg-slate-900/80 dark:bg-slate-50 dark:text-slate-900",
        secondary:
          "border-transparent bg-slate-100 text-slate-900 hover:bg-slate-100/80 dark:bg-zinc-800 dark:text-slate-50",
        destructive:
          "border-transparent bg-red-500/20 text-red-400 border-red-500/30",
        outline:
          "text-slate-950 border-slate-300 dark:text-slate-200 dark:border-zinc-700",
        accent:
          "border-accent/40 bg-accent/15 text-accent shadow-[0_0_10px_rgba(51,157,250,0.2)]",
        green:
          "border-[#22e873]/30 bg-[#22e873]/15 text-[#22e873] shadow-[0_0_10px_rgba(34,232,115,0.2)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
