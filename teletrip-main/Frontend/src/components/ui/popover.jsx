import * as React from "react";
import { cn } from "../../lib/utils";

const PopoverContext = React.createContext({
  open: false,
  setOpen: () => {},
});

const Popover = ({ open: controlledOpen, onOpenChange, children }) => {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const popoverRef = React.useRef(null);

  const setOpen = React.useCallback(
    (newOpen) => {
      if (!isControlled) {
        setUncontrolledOpen(newOpen);
      }
      if (onOpenChange) {
        onOpenChange(newOpen);
      }
    },
    [isControlled, onOpenChange]
  );

  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, setOpen]);

  return (
    <PopoverContext.Provider value={{ open, setOpen }}>
      <div ref={popoverRef} className="relative inline-block w-full">
        {children}
      </div>
    </PopoverContext.Provider>
  );
};

const PopoverTrigger = React.forwardRef(({ children, asChild, className, ...props }, ref) => {
  const { open, setOpen } = React.useContext(PopoverContext);
  return (
    <div
      ref={ref}
      role="button"
      tabIndex={0}
      onClick={(e) => {
        setOpen(!open);
      }}
      className={cn("cursor-pointer", className)}
      {...props}
    >
      {children}
    </div>
  );
});
PopoverTrigger.displayName = "PopoverTrigger";

const PopoverContent = React.forwardRef(
  ({ className, align = "center", sideOffset = 8, children, ...props }, ref) => {
    const { open } = React.useContext(PopoverContext);
    if (!open) return null;

    const alignmentClasses = {
      start: "left-0",
      center: "left-1/2 -translate-x-1/2",
      end: "right-0",
    };

    return (
      <div
        ref={ref}
        style={{ marginTop: sideOffset }}
        className={cn(
          "absolute top-full z-50 rounded-2xl border border-slate-200/90 bg-white p-4 text-slate-950 shadow-xl outline-none duration-150 animate-in fade-in-0 zoom-in-95",
          alignmentClasses[align] || "left-0",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
PopoverContent.displayName = "PopoverContent";

export { Popover, PopoverTrigger, PopoverContent };
