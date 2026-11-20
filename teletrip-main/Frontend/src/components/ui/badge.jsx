import * as React from "react";
import { cn, cva } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold tracking-tight transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 select-none",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-blue-600 text-white shadow-2xs hover:bg-blue-700",
        secondary:
          "border-transparent bg-slate-100 text-slate-800 hover:bg-slate-200",
        destructive:
          "border-transparent bg-red-100 text-red-700 border-red-200/80",
        outline: "text-slate-700 border-slate-200 bg-white",
        emerald:
          "border-emerald-200/80 bg-emerald-50 text-[#1F6A5B] font-bold",
        amber:
          "border-amber-200/80 bg-amber-50 text-[#9C621E] font-bold",
        blue:
          "border-blue-200/80 bg-blue-50 text-blue-700 font-bold",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
