import * as React from "react";
import { cn, cva } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-xs sm:text-sm font-bold tracking-tight transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none",
  {
    variants: {
      variant: {
        default:
          "bg-blue-600 text-white shadow-xs hover:bg-blue-700 active:scale-[0.98]",
        destructive:
          "bg-red-600 text-white shadow-xs hover:bg-red-700 active:scale-[0.98]",
        outline:
          "border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 shadow-2xs hover:border-slate-300",
        secondary:
          "bg-slate-100 text-slate-800 hover:bg-slate-200/80 shadow-2xs",
        ghost: "hover:bg-slate-100 text-slate-700 hover:text-slate-900",
        link: "text-blue-600 underline-offset-4 hover:underline font-semibold",
        emerald:
          "bg-[#1F6A5B] text-white shadow-xs hover:bg-[#185347] active:scale-[0.98]",
        amber:
          "bg-[#9C621E] text-white shadow-xs hover:bg-[#7c4e17] active:scale-[0.98]",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-7 rounded-lg px-2.5 text-xs",
        lg: "h-11 rounded-2xl px-6 text-sm sm:text-base",
        icon: "h-9 w-9 p-0 flex items-center justify-center rounded-xl",
        "icon-sm": "h-7 w-7 p-0 flex items-center justify-center rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
