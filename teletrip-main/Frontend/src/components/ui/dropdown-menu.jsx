import * as React from "react";
import { cn } from "../../lib/utils";

const DropdownContext = React.createContext({
  open: false,
  setOpen: () => {},
});

const DropdownMenu = ({ children }) => {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div ref={containerRef} className="relative inline-block text-left">
        {children}
      </div>
    </DropdownContext.Provider>
  );
};

const DropdownMenuTrigger = React.forwardRef(({ children, className, ...props }, ref) => {
  const { open, setOpen } = React.useContext(DropdownContext);
  return (
    <button
      ref={ref}
      type="button"
      onClick={() => setOpen(!open)}
      className={cn("outline-none cursor-pointer", className)}
      {...props}
    >
      {children}
    </button>
  );
});
DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

const DropdownMenuContent = React.forwardRef(
  ({ className, align = "end", children, ...props }, ref) => {
    const { open } = React.useContext(DropdownContext);
    if (!open) return null;

    return (
      <div
        ref={ref}
        className={cn(
          "absolute z-50 mt-2 min-w-[8rem] overflow-hidden rounded-xl border border-slate-200/90 bg-white p-1 text-slate-900 shadow-xl duration-150 animate-in fade-in-80",
          align === "end" ? "right-0" : "left-0",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
DropdownMenuContent.displayName = "DropdownMenuContent";

const DropdownMenuItem = React.forwardRef(({ className, onClick, children, ...props }, ref) => {
  const { setOpen } = React.useContext(DropdownContext);
  return (
    <div
      ref={ref}
      onClick={(e) => {
        if (onClick) onClick(e);
        setOpen(false);
      }}
      className={cn(
        "relative flex cursor-pointer select-none items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm font-semibold outline-none transition-colors hover:bg-slate-100 hover:text-slate-900",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
DropdownMenuItem.displayName = "DropdownMenuItem";

const DropdownMenuSeparator = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("-mx-1 my-1 h-px bg-slate-100", className)} {...props} />
));
DropdownMenuSeparator.displayName = "DropdownMenuSeparator";

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
};
